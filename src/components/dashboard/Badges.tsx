const STATUS_STYLES: Record<string, string> = {
  confirmed: "text-sky-300 bg-sky-500/10 border-sky-500/25",
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/25",
  "checked-in": "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  "checked-out": "text-zinc-400 bg-zinc-500/10 border-zinc-500/25",
  cancelled: "text-rose-300 bg-rose-500/10 border-rose-500/25",
  paid: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  refunded: "text-rose-300 bg-rose-500/10 border-rose-500/25",
  failed: "text-rose-300 bg-rose-500/10 border-rose-500/25",
};

const DOT_STYLES: Record<string, string> = {
  confirmed: "bg-sky-400",
  pending: "bg-amber-400",
  "checked-in": "bg-emerald-400",
  "checked-out": "bg-zinc-500",
  cancelled: "bg-rose-400",
  paid: "bg-emerald-400",
  refunded: "bg-rose-400",
  failed: "bg-rose-400",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const dot = DOT_STYLES[status] || DOT_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold capitalize tracking-wide ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.replace("-", " ")}
    </span>
  );
}

const METHOD_STYLES: Record<string, string> = {
  card: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  "bank-transfer": "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
  cash: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  "digital-wallet": "text-pink-300 bg-pink-500/10 border-pink-500/25",
  paypal: "text-sky-300 bg-sky-500/10 border-sky-500/25",
};

export function MethodBadge({ method }: { method: string }) {
  const style = METHOD_STYLES[method] || METHOD_STYLES.card;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium capitalize tracking-wide ${style}`}
    >
      {method.replace("-", " ")}
    </span>
  );
}

const SOURCE_STYLES: Record<string, string> = {
  website: "text-zinc-300 bg-zinc-500/10 border-zinc-500/25",
  phone: "text-orange-300 bg-orange-500/10 border-orange-500/25",
  "walk-in": "text-teal-300 bg-teal-500/10 border-teal-500/25",
  ota: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25",
  email: "text-indigo-300 bg-indigo-500/10 border-indigo-500/25",
};

export function SourceBadge({ source }: { source: string }) {
  const style = SOURCE_STYLES[source] || SOURCE_STYLES.website;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium capitalize tracking-wide ${style}`}
    >
      {source.replace("-", " ")}
    </span>
  );
}
