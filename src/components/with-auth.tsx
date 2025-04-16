import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithAuth(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const password = localStorage.getItem("admin-password");
      if (password !== ADMIN_PASSWORD) {
        router.push("/login?redirect=/admin");
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
