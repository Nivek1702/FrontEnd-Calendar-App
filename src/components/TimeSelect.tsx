// src/components/TimeSelect.tsx
import { useEffect, useRef, useState } from "react";
import "../css/TimeSelect.css";

type TimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

// Opciones de tiempo en formato 24h, de 07:00 a 22:55 en pasos de 5 minutos
const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  const STEP_MINUTES = 5; // cambia a 15 o 30 si quisieras menos granularidad

  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += STEP_MINUTES) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      opts.push(`${hh}:${mm}`);
    }
  }
  return opts;
})();

export default function TimeSelect({ value, onChange }: TimeSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="time-select" ref={wrapperRef}>
      <button
        type="button"
        className="form-select time-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <span className="time-select-caret"></span>
      </button>

      {open && (
        <div className="time-select-menu">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              className={
                "time-select-option" +
                (t === value ? " time-select-option--active" : "")
              }
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
