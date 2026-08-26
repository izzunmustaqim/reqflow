import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
    return (
        <div className="relative inline-block">
            {children}
        </div>
    );
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
    ({ className, children, ...props }, ref) => (
        <button ref={ref} className={cn("inline-flex", className)} {...props}>
            {children}
        </button>
    )
);
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { open?: boolean }>(
    ({ className, open, children, ...props }, ref) => {
        if (!open) return null;
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
