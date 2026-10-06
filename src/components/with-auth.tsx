import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { SkeletonRows } from "~/components/ds/skeleton-rows";

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
      return <div className="mx-auto max-w-[1200px] p-4 md:p-8"><SkeletonRows count={4} /></div>;
    }

    return <WrappedComponent {...props} />;
  };
}
