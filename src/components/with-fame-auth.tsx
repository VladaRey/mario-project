import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";

const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

export function withFameAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  return function WithFameAuth(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const password = localStorage.getItem("fame-password");
      if (password !== FAME_PASSWORD) {
        const userPassword = prompt("Please enter payment page password:");
        if (userPassword === FAME_PASSWORD) {
          localStorage.setItem("fame-password", userPassword);
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
