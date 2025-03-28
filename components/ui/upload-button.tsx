"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  text?: string;
  accept?: string;
  onChange?: (file: File) => void;
  className?: string;
}

export function UploadButton({ 
  text = "Upload", 
  accept = "image/*", 
  onChange,
  className
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
        onChange?.(file);
      }, 1000);
    }
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <Button 
        variant="outline" 
        className="relative overflow-hidden"
        disabled={isUploading}
      >
        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileChange}
          accept={accept}
        />
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Téléchargement..." : text}
      </Button>
    </div>
  );
} 