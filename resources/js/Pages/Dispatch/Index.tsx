import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { type DispatchIndexProps, type SampleRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import { Truck } from 'lucide-react';

export default function DispatchIndex({ dispatchableRequests }: DispatchIndexProps) {
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dispatch Console</h1>
                        <p className="text-sm text-zinc-500">Allocate batches and dispatch approved requests</p>
                    </div>
                </div>
                <Card>
                    <CardHeader><CardTitle>Awaiting Dispatch ({dispatchableRequests.total})</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Customer Site</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dispatchableRequests.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">No requests awaiting dispatch.</TableCell></TableRow>
                                ) : (
                                    dispatchableRequests.data.map((req: SampleRequest) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-mono text-xs font-medium">{req.request_id}</TableCell>
                                            <TableCell>{req.requester?.name}</TableCell>
                                            <TableCell>{req.customer_site}</TableCell>
                                            <TableCell><div className="flex flex-wrap gap-1">{req.lineItems?.map(li => (<Badge key={li.id} variant="secondary" className="text-xs">{li.product?.sku} ×{li.qty_requested}</Badge>))}</div></TableCell>
                                            <TableCell className="text-zinc-500">{formatDate(req.created_at)}</TableCell>
                                            <TableCell className="text-right"><Link href={`/dispatch/${req.id}`}><Button variant="outline" size="sm">Dispatch</Button></Link></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
