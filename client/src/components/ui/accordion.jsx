import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function Accordion({ children, className }) {
  return <div className={cn("divide-y divide-border rounded-[6px] bg-surface", className)}>{children}</div>;
}

export function AccordionItem({ value, title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-text-primary font-sans transition-colors hover:bg-surface-raised"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-xs text-text-secondary font-sans leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
