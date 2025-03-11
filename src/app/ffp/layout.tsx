import type { ReactNode } from "react";
import { Suspense } from "react";
import "./ffp.css"; 

export default function FfpLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>{children}</div>
    </Suspense>
  );
}
