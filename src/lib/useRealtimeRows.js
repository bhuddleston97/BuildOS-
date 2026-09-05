import { useCallback, useEffect, useRef, useState } from "react";
import { listRows } from "./db.js";
import { supabase } from "./supabase.js";

export function useRealtimeRows(table, options = {}) {
  const { eq = {}, page = 1, perPage = 100, sort } = options;
  const eqKey = JSON.stringify(eq);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const activeController = useRef(null);

  const load = useCallback(async (signal) => {
    const currentRequestId = ++requestId.current;
    let requestController;

    if (signal) {
      activeController.current = null;
    } else {
      activeController.current?.abort();
      requestController = new AbortController();
      activeController.current = requestController;
      signal = requestController.signal;
    }

    try {
      const nextRows = await listRows(table, { page, perPage, sort, eq: JSON.parse(eqKey), signal });
      if (!signal.aborted && currentRequestId === requestId.current) {
        setRows(nextRows);
        setError(null);
      }
    } catch (nextError) {
      if (nextError?.name !== "AbortError" && !signal.aborted && currentRequestId === requestId.current) {
        setError(nextError);
      }
    } finally {
      if (!signal.aborted && currentRequestId === requestId.current) setLoading(false);
      if (requestController && activeController.current === requestController) {
        activeController.current = null;
      }
    }
  }, [eqKey, page, perPage, sort, table]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal);

    const channel = supabase
      .channel(`realtime:${table}:${eqKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => load(),
      )
      .subscribe(status => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          setError(currentError => currentError?.message?.startsWith("Realtime") ? null : currentError);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setError(new Error(`Realtime subscription failed for ${table}: ${status}`));
        }
      });

    return () => {
      active = false;
      controller.abort();
      activeController.current?.abort();
      supabase.removeChannel(channel);
    };
  }, [eqKey, load, table]);

  return { rows, setRows, loading, error, reload: () => load() };
}
