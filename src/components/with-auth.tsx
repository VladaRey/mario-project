import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuth(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const password = localStorage.getItem("admin-password");
      if (password !== ADMIN_PASSWORD) {
        const userPassword = prompt("Please enter admin password:");
        if (userPassword === ADMIN_PASSWORD) {
          localStorage.setItem("admin-password", userPassword);
          setIsAuthenticated(true);
        } else {
          router.push("/");
        }
      } else {
        setIsAuthenticated(true);
      }
    }, [router]);

    if (!isAuthenticated) {
      return <div>Authenticating...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
