export function ActionDock({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 z-30 flex items-center gap-2 border-t border-line bg-white px-4 py-2.5 shadow-[0_-6px_16px_rgba(28,21,48,0.06)] md:hidden"
      style={{ bottom: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))" }}>
      {children}
    </div>
  );
}
