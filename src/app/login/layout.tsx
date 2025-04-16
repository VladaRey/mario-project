import type { ReactNode } from "react";
import { Suspense } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>{children}</div>
    </Suspense>
  );
}
