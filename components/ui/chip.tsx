type ChipProps = { label: string };

export default function Chip({ label }: ChipProps) {
  return (
    <span className="rounded-full border border-apple-near-black/10 bg-white px-3 py-1 sf-text-caption text-apple-near-black/68 dark:border-white/12 dark:bg-apple-surface-1 dark:text-white/68">
      {label}
    </span>
  );
}