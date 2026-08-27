import * as React from "react";
import { cn } from "@/lib/utils";

type ToastVariant = 'default' | 'success' | 'error';

interface ToastContextType {
    toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

interface ToastItem {
    id: number;
    message: string;
    variant: ToastVariant;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastItem[]>([]);
    const counterRef = React.useRef(0);

    const toast = React.useCallback((message: string, variant: ToastVariant = 'default') => {
        const id = counterRef.current++;
        setToasts(prev => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5 min-w-[300px]",
                            t.variant === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-900",
                            t.variant === 'error' && "bg-red-50 border-red-200 text-red-900",
                            t.variant === 'default' && "bg-white border-blue-200 text-blue-900",
                        )}
                    >
                        <p className="text-sm font-medium">{t.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
