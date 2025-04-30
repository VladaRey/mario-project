import { useEffect, useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

type Role = "guest" | "admin" | "fame";

export function useGetRole() {
  const [role, setRole] = useState<Role>("guest");

  useEffect(() => {
    const adminPassword = localStorage.getItem("admin-password");
    const famePassword = localStorage.getItem("fame-password");

    if (adminPassword === ADMIN_PASSWORD) {
      setRole("admin");
    } else if (famePassword === FAME_PASSWORD) {
      setRole("fame");
    } else {
      setRole("guest");
    }
  }, []);

  return role;
}
