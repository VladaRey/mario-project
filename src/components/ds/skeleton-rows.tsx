export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 py-3">
          <span className="h-9 w-9 rounded-full bg-[#ECE7F6]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="h-2.5 w-3/5 rounded bg-[#ECE7F6]" />
            <span className="h-2 w-2/5 rounded bg-[#F3F0F9]" />
          </div>
        </div>
      ))}
    </div>
  );
}
