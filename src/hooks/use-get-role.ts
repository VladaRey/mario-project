import { useCallback, useSyncExternalStore } from "react";
import { Role } from "~/lib/roles";

export const ROLE_CHANGE_EVENT = "mg:role-change";
const ADMIN_KEY = "admin-password";
const FAME_KEY = "fame-password";

export function roleFromStorage(
  adminPw: string | null,
  famePw: string | null,
  envAdmin: string | undefined = process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  envFame: string | undefined = process.env.NEXT_PUBLIC_FAME_PASSWORD,
): Role {
  if (envAdmin && adminPw === envAdmin) return Role.Admin;
  if (envFame && famePw === envFame) return Role.Fame;
  return Role.Guest;
}

function read(): Role {
  try {
    return roleFromStorage(localStorage.getItem(ADMIN_KEY), localStorage.getItem(FAME_KEY));
  } catch {
    return Role.Guest;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(ROLE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ROLE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const notify = () => window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));

export function useGetRole() {
  const role = useSyncExternalStore(subscribe, read, () => Role.Guest);

  const login = useCallback((password: string): Role => {
    const next = roleFromStorage(password, password);
    try {
      if (next === Role.Admin) localStorage.setItem(ADMIN_KEY, password);
      if (next === Role.Fame) localStorage.setItem(FAME_KEY, password);
    } catch { /* storage blocked */ }
    notify();
    return next;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_KEY);
      localStorage.removeItem(FAME_KEY);
    } catch { /* storage blocked */ }
    notify();
  }, []);

  return { role, login, logout };
}
