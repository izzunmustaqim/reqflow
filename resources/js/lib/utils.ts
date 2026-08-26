import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function statusColor(status: string): string {
    const map: Record<string, string> = {
        'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
        'Submitted': 'bg-blue-100 text-blue-700 border-blue-200',
        'Pending Approval': 'bg-amber-100 text-amber-700 border-amber-200',
        'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Dispatched': 'bg-blue-200 text-blue-800 border-blue-300',
        'Signed': 'bg-cyan-100 text-cyan-700 border-cyan-200',
        'Closed': 'bg-slate-200 text-slate-600 border-slate-300',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
}
