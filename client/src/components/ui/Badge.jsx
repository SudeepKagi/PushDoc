import React from "react";

export default function Badge({ status }) {
    const s = status.toUpperCase();
    let badgeClass = "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ";
    
    if (s === "ACTIVE RUN" || s === "ACTIVE") {
        badgeClass += "bg-primary text-white";
    } else if (s === "COMPLETED") {
        badgeClass += "bg-secondary-container/20 text-secondary";
    } else if (s === "FAILED") {
        badgeClass += "bg-error-container/20 text-error";
    } else if (s === "PRIMARY") {
        badgeClass += "bg-primary-fixed text-primary text-[10px] py-1";
    } else if (s === "STANDBY") {
        badgeClass += "bg-surface-container-highest text-on-surface-variant text-[10px] py-1";
    } else if (s === "FAILOVER") {
        badgeClass += "bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] py-1";
    } else {
        badgeClass += "bg-surface-container-low text-on-surface-variant";
    }

    return <span className={badgeClass}>{status}</span>;
}
