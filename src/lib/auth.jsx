
import {
 createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setUser(null);
      } else {
        setUser(await hydrateUser(user));
      }

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        return;
      }

      hydrateUser(session.user).then(hydrated => {
        if (mounted) setUser(hydrated);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const hydrated = await hydrateUser(data.user);
    setUser(hydrated);
    return hydrated;
  }

  async function signUp(data) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
        data: {
          full_name: data.full_name || "",
          job_title: data.job_title || "",
        },
      },
    });

    if (error) {
      throw error;
    }

    const hydrated = authData.user ? await hydrateUser(authData.user) : null;
    setUser(authData.session ? hydrated : null);

    return {
      user: hydrated,
      requiresEmailConfirmation: Boolean(authData.user && !authData.session),
    };
  }

  async function resendConfirmation(email) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signIn,
        signUp,
        resendConfirmation,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}

async function hydrateUser(authUser) {
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Unable to load user profile:", error);
  }

  return {
    ...authUser,
    ...(profile || {}),
    full_name: profile?.full_name || authUser.user_metadata?.full_name || "",
    job_title: profile?.job_title || authUser.user_metadata?.job_title || "",
    email: authUser.email || profile?.email || "",
  };
}
