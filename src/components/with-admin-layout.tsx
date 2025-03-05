import { Navbar } from "./navbar";
import { ComponentType } from "react";
import { Toaster } from "./ui/sonner";
import { withAuth } from "./with-auth";

export function withAdminLayout<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  const AuthenticatedComponent = withAuth(WrappedComponent);

  return function WithAdminLayout(props: P) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <Toaster position="top-center" />
        <main>
          <AuthenticatedComponent {...props} />
        </main>
      </div>
    );
  };
}
