import { type ComponentType } from "react";
import { withAuth } from "./with-auth";

export function withAdminLayout<P extends object>(WrappedComponent: ComponentType<P>) {
  return withAuth(WrappedComponent);
}
