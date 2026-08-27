import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { type PageProps as InertiaPageProps } from '@inertiajs/core';
import { cn } from '@/lib/utils';
import { type User } from '@/types';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { auth } = usePage<InertiaPageProps & { auth: { user: User | null } }>().props;
    const user = auth?.user;

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', roles: ['sales_rep', 'manager', 'admin'] },
        { label: 'New Request', href: '/requests/create', roles: ['sales_rep'] },
        { label: 'Approvals', href: '/approvals', roles: ['manager'] },
        { label: 'Dispatch', href: '/dispatch', roles: ['sales_rep', 'admin'] },
        { label: 'Admin', href: '/admin', roles: ['admin'] },
    ];

    const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-900 dark:text-blue-100">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">SM</div>
                            SampleHub
                        </Link>
                        <nav className="hidden md:flex items-center gap-1">
                            {filteredNav.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
                                        "dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                                    <p className="text-xs text-zinc-500 capitalize">{user.role.replace('_', ' ')}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="ml-1 text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                                    title="Logout"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
