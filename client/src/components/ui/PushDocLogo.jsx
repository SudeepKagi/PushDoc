import React from "react";

export function PushDocLogo({ className = "", ...props }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} {...props}>
      <svg
        viewBox="0 0 100 100"
        className="h-8 w-8 text-foreground shrink-0"
        fill="currentColor"
      >
        {/* Outer 'P' shape */}
        <path d="M 50 5 C 74.8 5 95 25.2 95 50 C 95 74.8 74.8 95 50 95 C 42.5 95 35.5 93 30 89.5 L 14 96.5 C 10.5 98 7 95 7 91.5 L 7 45 C 7 22.9 26.3 5 50 5 Z" />
        {/* Inner 4-point star cutout */}
        <path
          d="M 54 22 C 54 38 40 50 24 50 C 40 50 54 62 54 78 C 54 62 68 50 84 50 C 68 50 54 38 54 22 Z"
          fill="var(--background, #0b0c0e)"
        />
      </svg>
      <span className="font-extrabold text-lg tracking-tight text-foreground">
        PushDoc
      </span>
    </div>
  );
}
