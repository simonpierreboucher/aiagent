"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const predefinedColors = [
  "#000000", "#ffffff", "#f44336", "#e91e63", "#9c27b0", "#673ab7", 
  "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", 
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
  "#795548", "#607d8b"
];

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color);

  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    onChange(newColor);
  };

  const handlePredefinedColorClick = (color: string) => {
    setSelectedColor(color);
    onChange(color);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn("h-10 w-full rounded-md border border-input flex items-center gap-2 px-3", className)}
          type="button"
        >
          <div 
            className="h-5 w-5 rounded-full border" 
            style={{ backgroundColor: selectedColor }}
          />
          <span>{selectedColor}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <div className="flex justify-center">
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="h-10 w-full cursor-pointer"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                className={cn(
                  "h-6 w-6 rounded-full border-2", 
                  selectedColor === color ? "border-ring" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => handlePredefinedColorClick(color)}
                type="button"
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 