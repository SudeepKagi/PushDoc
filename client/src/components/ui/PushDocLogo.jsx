import React from "react";

export function PushDocLogo({ className = "h-7 w-auto", ...props }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} {...props}>
      <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md border border-primary/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <span className="font-extrabold text-lg tracking-tight text-foreground">
        PushDoc
      </span>
    </div>
  );
}
