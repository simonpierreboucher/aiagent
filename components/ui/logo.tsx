import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function Logo({
  className,
  showText = true,
  size = 'md',
  href
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const dimensions = {
    sm: 32,
    md: 40,
    lg: 48
  };

  const logoComponent = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Image
          src="/favicon.ico" 
          alt="M-LAI Logo"
          width={dimensions[size]}
          height={dimensions[size]}
          className="rounded-full"
        />
      </div>
      {showText && (
        <span className={cn("font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text", textSizeClasses[size])}>
          M-LAI
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-transform hover:scale-105">
        {logoComponent}
      </Link>
    );
  }

  return logoComponent;
} 