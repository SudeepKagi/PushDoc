import React from "react";
import logoImg from "../../logo.png";

export function PushDocLogo({ className = "", ...props }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} {...props}>
      <img
        src={logoImg}
        alt="PushDoc"
        className="h-8 w-8 object-contain rounded-lg border border-border bg-card p-0.5 shadow-sm transition-transform hover:scale-105"
      />
      <span className="font-extrabold text-lg tracking-tight text-foreground">
        PushDoc
      </span>
    </div>
  );
}
