"use client";

import { useId } from "react";

interface SegmentedProps<T extends string> {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Radio group styled as a segmented control; native inputs give keyboard and SR support. */
export function Segmented<T extends string>({ legend, value, options, onChange }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-sf-chip p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={[
              "relative flex h-9 cursor-pointer items-center whitespace-nowrap rounded-full px-4 text-[14px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sf-blue",
              value === option.value
                ? "bg-white font-semibold text-sf-ink shadow-[0_1px_2px_rgba(11,11,12,.1)]"
                : "font-medium text-sf-muted hover:text-sf-ink",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
