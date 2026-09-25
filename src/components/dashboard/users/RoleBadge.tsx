const ROLE_STYLES: Record<string, string> = {
  admin: "text-gold-300 bg-gold-500/10 border-gold-500/30",
  manager: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  staff: "text-sky-300 bg-sky-500/10 border-sky-500/25",
  viewer: "text-zinc-300 bg-zinc-500/10 border-zinc-500/25",
};

const ROLE_DOT_STYLES: Record<string, string> = {
  admin: "bg-gold-400",
  manager: "bg-violet-400",
  staff: "bg-sky-400",
  viewer: "bg-zinc-500",
};

export function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.viewer;
  const dot = ROLE_DOT_STYLES[role] || ROLE_DOT_STYLES.viewer;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold capitalize tracking-wide ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {role}
    </span>
  );
}