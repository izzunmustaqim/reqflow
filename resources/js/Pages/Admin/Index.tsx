import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type AdminIndexProps, type SampleRequest, type AuditLog } from '@/types';
import { statusColor, formatDate, formatDateTime } from '@/lib/utils';
import { Download, Filter, Search } from 'lucide-react';

export default function AdminIndex({ allRequests, auditLogs }: AdminIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Pending Approval', label: 'Pending Approval' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Dispatched', label: 'Dispatched' },
        { value: 'Signed', label: 'Signed' },
        { value: 'Closed', label: 'Closed' },
    ];

    const handleFilter = (status: string) => {
        router.get('/admin', { status, search: searchTerm }, { preserveState: true, replace: true });
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin & Finance Hub</h1>
                        <p className="text-sm text-zinc-500">Compliance trails, audit logs, and data export</p>
                    </div>
                    <Button onClick={() => window.location.href = `/admin/export?${new URLSearchParams(window.location.search).toString()}`} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle>All Requests ({allRequests.total})</CardTitle>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                                    <Input
                                        className="pl-9 w-60"
                                        placeholder="Search ID or site..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && router.get('/admin', { search: searchTerm }, { preserveState: true })}
                                    />
                                </div>
                                <Select options={statusOptions} value="" onChange={e => handleFilter(e.target.value)} className="w-44" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Approved</TableHead>
                                    <TableHead>Dispatched</TableHead>
                                    <TableHead>Signed</TableHead>
                                    <TableHead>Signer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allRequests.data.map((req: SampleRequest) => (
                                    <TableRow key={req.id} className="cursor-pointer hover:bg-blue-50" onClick={() => router.visit(`/requests/${req.id}`)}>
                                        <TableCell className="font-mono text-xs font-medium">{req.request_id}</TableCell>
                                        <TableCell className="text-sm">{req.requester?.name}</TableCell>
                                        <TableCell className="text-sm">{req.customer_site}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {req.lineItems?.map(li => (
                                                    <Badge key={li.id} variant="secondary" className="text-xs">{li.product?.sku}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge className={statusColor(req.status)}>{req.status}</Badge></TableCell>
                                        <TableCell className="text-xs text-zinc-500">{formatDate(req.approved_at)}</TableCell>
                                        <TableCell className="text-xs text-zinc-500">{formatDate(req.dispatched_at)}</TableCell>
                                        <TableCell className="text-xs text-zinc-500">{formatDate(req.signed_at)}</TableCell>
                                        <TableCell className="text-sm">{req.signOff?.signer_name ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {allRequests.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {allRequests.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} preserveState>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Request</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditLogs.data.map((log: AuditLog) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs text-zinc-500">{formatDateTime(log.timestamp)}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-xs">{log.event_type}</Badge></TableCell>
                                        <TableCell className="text-sm">{log.actor?.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{log.sampleRequest?.request_id}</TableCell>
                                        <TableCell className="text-xs text-zinc-500 max-w-xs truncate">{JSON.stringify(log.payload_before_after?.after || {}).slice(0, 80)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
