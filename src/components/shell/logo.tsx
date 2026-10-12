import Link from "next/link";
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-white">
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-coral text-[15px] font-extrabold text-ink">M</span>
      <span className="text-[17px] font-extrabold tracking-tight">Mario Group</span>
    </Link>
  );
}
