type MediaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function MediaField({ label, value, placeholder, onChange }: MediaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="sf-text-micro text-apple-near-black/56 dark:text-white/56">{label}</label>
      <input type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full" />
    </div>
  );
}