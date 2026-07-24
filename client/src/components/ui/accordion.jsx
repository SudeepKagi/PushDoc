import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function Accordion({ children, className }) {
  return <div className={cn("divide-y divide-border rounded-lg border border-border bg-card", className)}>{children}</div>;
}

export function AccordionItem({ value, title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground transition-all hover:bg-muted/50"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}
