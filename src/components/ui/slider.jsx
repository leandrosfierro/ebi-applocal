import React from "react";

export function Slider({ value = [3], min = 1, max = 5, step = 1, onValueChange }) {
  const v = value?.[0] ?? 3;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange && onValueChange([Number(e.target.value)])}
      className="w-full"
    />
  );
}
