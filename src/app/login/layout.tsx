import { Suspense, type ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-brand-900" />}>
      <div>{children}</div>
    </Suspense>
  );
}
