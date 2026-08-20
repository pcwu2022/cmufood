import { useEffect, useRef, useState } from "react";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: Set<string> | null;
  onChange: (next: Set<string> | null) => void;
  exclusiveOptions?: string[];
}

/**
 * A dropdown checklist filter. Null means "All" (no restriction), while an
 * empty set means that no options are selected.
 */
export default function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  exclusiveOptions = [],
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAll = selected === null;

  const toggleOption = (opt: string) => {
    if (isAll && exclusiveOptions.includes(opt)) {
      onChange(new Set([opt]));
      return;
    }
    // When "All" is active, every option renders as checked. Clicking one
    // means "everything except this" rather than "just this".
    const base = isAll ? new Set(options) : new Set(selected);
    if (base.has(opt)) {
      base.delete(opt);
    } else {
      base.add(opt);
    }
    // If everything ends up selected, collapse back to "All".
    if (base.size === options.length) {
      onChange(null);
    } else {
      onChange(base);
    }
  };

  const summary = isAll
    ? "All"
    : selected.size === 1
      ? [...selected][0]
      : `${selected.size} selected`;

  return (
    <div className="filter-select" ref={ref}>
      <button
        type="button"
        className={`filter-select-trigger${isAll ? "" : " filter-select-trigger--active"}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="filter-select-label">{label}</span>
        <span className="filter-select-summary">{summary}</span>
        <span className="filter-select-caret" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="filter-select-panel" role="listbox">
          <label className="filter-select-option filter-select-option--all">
            <input
              type="checkbox"
              checked={isAll}
              onChange={() => onChange(isAll ? new Set() : null)}
            />
            <span>All</span>
          </label>
          <div className="filter-select-divider" />
          {options.map((opt) => (
            <label className="filter-select-option" key={opt}>
              <input
                type="checkbox"
                checked={isAll || selected.has(opt)}
                onChange={() => toggleOption(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
