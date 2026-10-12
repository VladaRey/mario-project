export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#D8D2E6] px-6 py-8 text-center">
      {icon ? <div className="text-brand-700">{icon}</div> : null}
      <div className="text-[15px] font-extrabold">{title}</div>
      {text ? <div className="text-[13px] text-muted-foreground">{text}</div> : null}
      {action}
    </div>
  );
}
