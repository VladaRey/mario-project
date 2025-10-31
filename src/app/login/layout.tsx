import { Suspense, type ReactNode } from "react";
import FullSizeLoader from "~/components/full-size-loader";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullSizeLoader />}>
      <div>{children}</div>
    </Suspense>
  );
}
