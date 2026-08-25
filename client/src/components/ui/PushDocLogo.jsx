import React from "react";

export function PushDocLogo({ className = "", ...props }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <img
        src="/logo.png"
        alt="PushDoc Logo"
        className="h-7 w-auto max-h-7 object-contain shrink-0"
      />
      <span className="font-semibold text-base tracking-tight text-text-primary font-sans">
        PushDoc
      </span>
    </div>
  );
}
