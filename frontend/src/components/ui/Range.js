// src/components/ui/Range.js
export function Range({ label, value, onChange, min = 1, max = 5 }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label className="font-medium">{label}</label>
        <span className="text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}
