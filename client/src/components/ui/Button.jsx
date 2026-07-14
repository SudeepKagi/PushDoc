import React from "react";

export default function Button({ children, className = "", variant = "primary", ...props }) {
    let baseStyles = "px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 hover:scale-105";
    
    if (variant === "primary") {
        baseStyles += " bg-primary text-white hover:brightness-110";
    } else if (variant === "dark") {
        baseStyles += " bg-on-background text-surface hover:opacity-90";
    } else if (variant === "secondary") {
        baseStyles += " border border-outline-variant text-on-surface-variant hover:bg-surface-container-high";
    } else if (variant === "ghost") {
        baseStyles += " text-on-surface-variant hover:text-primary";
    }

    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
}
