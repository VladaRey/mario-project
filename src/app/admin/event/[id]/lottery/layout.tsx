import { Suspense } from "react";
import type { ReactNode } from "react";

export default function LotteryLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>{children}</div>
    </Suspense>
  );
}
