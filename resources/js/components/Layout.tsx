import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { type PageProps as InertiaPageProps } from '@inertiajs/core';
import { cn } from '@/lib/utils';
import { type User } from '@/types';
import {
    LayoutDashboard,
    PlusCircle,
    ClipboardCheck,
    Truck,
    Shield,
    LogOut,
    Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['sales_rep', 'manager', 'admin'] },
    { label: 'New Request', href: '/requests/create', icon: PlusCircle, roles: ['sales_rep'] },
    { label: 'Approvals', href: '/approvals', icon: ClipboardCheck, roles: ['manager'] },
    { label: 'Dispatch', href: '/dispatch', icon: Truck, roles: ['sales_rep', 'admin'] },
    { label: 'Admin', href: '/admin', icon: Shield, roles: ['admin'] },
];

function SidebarNav({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
    const page = usePage();
    const filteredNav = navItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-14 items-center gap-2 px-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    SM
                </div>
                <span className="font-bold text-lg text-blue-900 dark:text-blue-100">SampleHub</span>
            </div>

            <Separator />

            {/* Nav links */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {filteredNav.map(item => {
                    const isActive = page.url.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <Separator />

            {/* User section */}
            <div className="flex items-center gap-3 px-4 py-4">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <button
                    onClick={() => router.post('/logout')}
                    className="shrink-0 p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function Layout({ children }: LayoutProps) {
    const { auth } = usePage<InertiaPageProps & { auth: { user: User | null } }>().props;
    const user = auth?.user;
    const [sheetOpen, setSheetOpen] = useState(false);

    if (!user) return <>{children}</>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Desktop sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r bg-white dark:bg-zinc-900">
                <SidebarNav user={user} />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    <SidebarNav user={user} onNavigate={() => setSheetOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* Main area */}
            <div className="lg:pl-64">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-4 lg:hidden dark:bg-zinc-900/80">
                    <button
                        onClick={() => setSheetOpen(true)}
                        className="p-2 -ml-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-900 dark:text-blue-100">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold">SM</div>
                        SampleHub
                    </Link>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
