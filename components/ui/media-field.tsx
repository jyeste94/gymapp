
type MediaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function MediaField({ label, value, placeholder, onChange }: MediaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-[#51607c]">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}
