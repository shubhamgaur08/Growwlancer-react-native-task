import "react-native-url-polyfill/auto";
import { Session, SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

type MaybeSession = Session | null;

type SupabaseContext = {
  supabase: SupabaseClient;
  session: MaybeSession;
  isPending: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createClient(SUPABASE_URL!,SUPABASE_ANON_KEY!, {
      auth: { storage: AsyncStorage as any },
    })
  );
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      console.log("AUTH CHANGE");
    });
    setIsPending(false);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Context.Provider value={{ supabase, session, isPending }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }

  return context;
};
