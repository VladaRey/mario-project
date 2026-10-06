"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { playerOperations } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";

export function usePenaltyCount(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    playerOperations.getAllPlayers()
      .then((ps) => { if (alive) setCount(ps.filter(isPenalized).length); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [pathname]);
  return count;
}
