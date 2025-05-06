import { useEffect, useState } from "react";
import { Role } from "~/lib/roles";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

export function useGetRole() {
  const [role, setRole] = useState<Role>(Role.Guest);

  useEffect(() => {
    const adminPassword = localStorage.getItem("admin-password");
    const famePassword = localStorage.getItem("fame-password");

    if (adminPassword === ADMIN_PASSWORD) {
      setRole(Role.Admin);
    } else if (famePassword === FAME_PASSWORD) {
      setRole(Role.Fame);
    } else {
      setRole(Role.Guest);
    }
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-password", password);
      setRole(Role.Admin);
      return Role.Admin;
    } else if (password === FAME_PASSWORD) {
      localStorage.setItem("fame-password", password);
      setRole(Role.Fame);
      return Role.Fame;
    } else {
      setRole(Role.Guest);
      return Role.Guest;
    }
  };

  return { role, login };
}
