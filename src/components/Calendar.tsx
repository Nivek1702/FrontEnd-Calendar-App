import { useMemo, useState } from "react";

function getMonthMatrix(year: number, month: number) {
  // month: 0-11
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; date?: string }> = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ day: d, date: dt.toISOString().slice(0, 10) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function Calendar() {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const { year, month } = useMemo(
    () => ({ year: cursor.getFullYear(), month: cursor.getMonth() }),
    [cursor]
  );

  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthName = cursor.toLocaleString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ◀
        </button>
        <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
        <button
          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-1">
        {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((c, i) => {
          const isToday =
            c.day &&
            new Date().toDateString() === new Date(year, month, c.day).toDateString();

          return (
            <div
              key={i}
              className={
                "h-20 rounded-xl border flex items-start justify-end p-2 " +
                (c.day
                  ? isToday
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-white"
                  : "bg-gray-50")
              }
            >
              <span className="text-sm">{c.day ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
