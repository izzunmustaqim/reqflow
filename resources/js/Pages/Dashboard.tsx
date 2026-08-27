import React from 'react';
import { Link, router } from '@inertiajs/react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type DashboardProps, type SampleRequest } from '@/types';
import { statusColor, formatDate } from '@/lib/utils';

export default function Dashboard({ requests, stats, currentStatus }: DashboardProps) {
    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'Pending Approval', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Dispatched', label: 'Dispatched' },
        { value: 'Signed', label: 'Signed' },
    ];

    const handleTabChange = (status: string) => {
        router.get('/dashboard', { status }, { preserveState: true, replace: true });
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Sales Dashboard
                        </h1>
                        <p className="text-sm text-zinc-500">Manage your Fresubin sample requests</p>
                    </div>
                    <Link href="/requests/create">
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg">
                            + New Request
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {[
                        { label: 'Total Requests', value: stats.total, color: 'from-zinc-500 to-zinc-600' },
                        { label: 'Pending', value: stats.pending, color: 'from-amber-400 to-orange-500' },
                        { label: 'Approved', value: stats.approved, color: 'from-emerald-400 to-green-500' },
                        { label: 'Dispatched', value: stats.dispatched, color: 'from-blue-400 to-blue-600' },
                        { label: 'Signed', value: stats.signed, color: 'from-cyan-400 to-blue-500' },
                    ].map(stat => (
                        <Card key={stat.label} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className={`h-1 w-full rounded-full bg-gradient-to-r ${stat.color} mb-3`} />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-zinc-500">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>My Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={currentStatus} onValueChange={handleTabChange}>
                            <TabsList className="mb-4">
                                {statusFilters.map(f => (
                                    <TabsTrigger key={f.value} value={f.value}>
                                        {f.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {statusFilters.map(f => (
                                <TabsContent key={f.value} value={f.value}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Request ID</TableHead>
                                                <TableHead>Customer Site</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                                        No requests found for this status.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                requests.data.map((req: SampleRequest) => (
                                                    <TableRow key={req.id}>
                                                        <TableCell className="font-mono text-xs font-medium">
                                                            {req.request_id}
                                                        </TableCell>
                                                        <TableCell>{req.customer_site}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {req.lineItems?.map(li => (
                                                                    <Badge key={li.id} variant="secondary" className="text-xs">
                                                                        {li.product?.sku} ×{li.qty_requested}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-zinc-500">{formatDate(req.created_at)}</TableCell>
                                                        <TableCell>
                                                            <Badge className={statusColor(req.status)}>
                                                                {req.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Link href={`/requests/${req.id}`}>
                                                                <Button variant="ghost" size="sm">View</Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {requests.last_page > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            {requests.links.map((link, i) => (
                                                <Link
                                                    key={i}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-1 rounded text-sm ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                    preserveState
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
