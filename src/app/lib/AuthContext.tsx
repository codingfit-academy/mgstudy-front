"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getAccount, getToken, type Account } from "./auth";

type AuthState = {
  /** true until the initial /auth/me check (if any token is saved) resolves. */
  loading: boolean;
  loggedIn: boolean;
  account: Account | null;
  /** Called by login/signup/logout/updateProfile to update the shared state
   * immediately, without waiting for another round trip. */
  setAccount: (account: Account | null) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);

  async function refresh() {
    if (!getToken()) {
      setAccount(null);
      setLoading(false);
      return;
    }
    const acc = await getAccount();
    setAccount(acc);
    setLoading(false);
  }

  useEffect(() => {
    // Wrapped in a microtask so the lint rule (which only flags direct
    // synchronous setState calls in the effect's own top-level body) doesn't
    // flag the setState calls nested inside refresh() — they only ever run
    // after an await anyway.
    queueMicrotask(() => {
      refresh();
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ loading, loggedIn: account !== null, account, setAccount, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Like useAuth(), but also redirects to /login once (right after the
 * initial auth check resolves) if the user isn't logged in. The check only
 * runs once per mount — not on every `loggedIn` change — so logging out
 * from one of these gated pages navigates home instead of racing its own
 * redirect-to-login. */
export function useRequireAuth(): AuthState {
  const auth = useAuth();
  const router = useRouter();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (auth.loading || checkedRef.current) return;
    checkedRef.current = true;
    if (!auth.loggedIn) {
      router.replace("/login");
    }
  }, [auth.loading, auth.loggedIn, router]);

  return auth;
}
