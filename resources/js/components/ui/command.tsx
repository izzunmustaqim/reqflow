import * as React from "react";
import { cn } from "@/lib/utils";

interface CommandProps {
    children: React.ReactNode;
    className?: string;
}

function Command({ children, className }: CommandProps) {
    return <div className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}>{children}</div>;
}

function CommandInput({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex items-center border-b px-3">
            <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function CommandList({ children }: { children: React.ReactNode }) {
    return <div className="max-h-[300px] overflow-y-auto p-1">{children}</div>;
}

function CommandEmpty({ children }: { children: React.ReactNode }) {
    return <div className="py-6 text-center text-sm">{children}</div>;
}

function CommandGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
    return (
        <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
            {children}
        </div>
    );
}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    onSelect?: () => void;
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, children, onSelect, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                className
            )}
            onClick={onSelect}
            {...props}
        >
            {children}
        </div>
    )
);
CommandItem.displayName = "CommandItem";

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
