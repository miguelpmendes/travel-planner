"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function TimeSelect({
  value,
  onChange,
}: {
  value: string; // "HH:MM" or ""
  onChange: (value: string) => void;
}) {
  const [h, m] = value ? value.split(":") : ["", ""];

  function handleHour(hour: string) {
    if (!hour) { onChange(""); return; }
    onChange(`${hour}:${m || "00"}`);
  }

  function handleMinute(minute: string) {
    onChange(`${h || "00"}:${minute}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={h}
        onChange={(e) => handleHour(e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Hora</option>
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>{hh}h</option>
        ))}
      </select>

      <select
        value={m}
        onChange={(e) => handleMinute(e.target.value)}
        disabled={!h}
        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-40"
      >
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>{mm}min</option>
        ))}
      </select>
    </div>
  );
}
