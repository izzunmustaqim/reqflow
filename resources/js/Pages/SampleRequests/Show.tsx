import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { type ShowRequestProps } from '@/types';
import { statusColor, formatDateTime, formatDate } from '@/lib/utils';

export default function ShowSampleRequest({ sampleRequest: req }: ShowRequestProps) {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">← Back to Dashboard</Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{req.request_id}</h1>
                            <Badge className={statusColor(req.status)}>{req.status}</Badge>
                        </div>
                    </div>
                    {req.status === 'Draft' && (
                        <Link href={`/requests/${req.id}/submit`} method="post" as="button">
                            <Button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">Submit for Approval</Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Request Information</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between"><span className="text-zinc-500">Customer Site</span><span className="font-medium">{req.customer_site}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Purpose</span><span className="font-medium">{req.purpose}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Delivery Location</span><span className="font-medium">{req.delivery_location}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Created</span><span className="font-medium">{formatDate(req.created_at)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Requester</span><span className="font-medium">{req.requester?.name}</span></div>
                            {req.remarks && <div className="pt-2 border-t"><span className="text-zinc-500 text-sm">Remarks:</span><p className="text-sm mt-1">{req.remarks}</p></div>}
                            {req.manager_comments && <div className="pt-2 border-t"><span className="text-zinc-500 text-sm">Manager Comments:</span><p className="text-sm mt-1">{req.manager_comments}</p></div>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between"><span className="text-zinc-500">Submitted</span><span className="font-medium">{formatDateTime(req.created_at)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Approved</span><span className="font-medium">{formatDateTime(req.approved_at)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Dispatched</span><span className="font-medium">{formatDateTime(req.dispatched_at)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Signed</span><span className="font-medium">{formatDateTime(req.signed_at)}</span></div>
                            {req.signOff && (
                                <div className="pt-3 border-t space-y-2">
                                    <p className="text-sm font-medium">Sign-Off Details</p>
                                    <div className="flex justify-between text-sm"><span className="text-zinc-500">Signer</span><span>{req.signOff.signer_name}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-zinc-500">Role</span><span>{req.signOff.role}</span></div>
                                    {req.signOff.signature_path && <img src={`/storage/${req.signOff.signature_path}`} alt="Signature" className="h-16 mt-2 border rounded" />}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Qty Requested</TableHead>
                                    <TableHead className="text-right">Qty Dispatched</TableHead>
                                    <TableHead>Batch</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {req.lineItems?.map(li => (
                                    <TableRow key={li.id}>
                                        <TableCell>{li.product?.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{li.product?.sku}</TableCell>
                                        <TableCell className="text-right">{li.qty_requested}</TableCell>
                                        <TableCell className="text-right">{li.qty_dispatched ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs">{li.inventoryBatch?.batch_no ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {req.signOff && (
                    <Card className="bg-gradient-to-br from-blue-50 to-slate-50">
                        <CardHeader><CardTitle>Compliance Receipt</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-blue-600">This sample request has been signed off and is now closed.</p>
                                <div className="flex justify-center gap-8 mt-4">
                                    <div>
                                        <p className="text-xs text-zinc-500">Digital Signature</p>
                                        {req.signOff.signature_path && <img src={`/storage/${req.signOff.signature_path}`} alt="Signature" className="h-20 mt-1 border rounded bg-white" />}
                                    </div>
                                    {req.signOff.stamp_path && (
                                        <div>
                                            <p className="text-xs text-zinc-500">Corporate Stamp</p>
                                            <img src={`/storage/${req.signOff.stamp_path}`} alt="Stamp" className="h-20 mt-1 border rounded bg-white" />
                                        </div>
                                    )}
                                </div>
                                <Button variant="outline" className="mt-4" onClick={() => window.print()}>Print Receipt</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
