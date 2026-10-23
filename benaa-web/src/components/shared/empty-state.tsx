export function EmptyState({ icon, title, description, children }: { icon?: React.ReactNode; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-12 text-center">
      {icon && <div className="text-sand-deep [&_svg]:h-10 [&_svg]:w-10">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
