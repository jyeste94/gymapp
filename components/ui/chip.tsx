
type ChipProps = { label: string };

export default function Chip({ label }: ChipProps) {
  return (
    <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs text-[#4b5a72]">
      {label}
    </span>
  );
}
