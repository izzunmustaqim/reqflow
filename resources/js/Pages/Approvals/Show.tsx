import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';
import { type ApprovalShowProps } from '@/types';
import { statusColor, formatDate } from '@/lib/utils';
import { useToast } from '@/Components/ui/toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ApprovalShow({ sampleRequest: req }: ApprovalShowProps) {
    const { toast } = useToast();
    const { data, setData, put, processing, errors } = useForm({
        action: '' as 'approve' | 'reject' | '',
        manager_comments: '',
    });

    const handleSubmit = (submitAction: 'approve' | 'reject') => {
        if (submitAction === 'reject' && !data.manager_comments) return;
        setData('action', submitAction);
        put(`/approvals/${req.id}`, {
            onSuccess: () => toast(submitAction === 'approve' ? 'Request approved!' : 'Request rejected.', submitAction === 'approve' ? 'success' : 'error'),
        });
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Link href="/approvals" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">← Back to Approvals</Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Review: {req.request_id}</h1>
                        <Badge className={statusColor(req.status)}>{req.status}</Badge>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between"><span className="text-zinc-500">Requester</span><span className="font-medium">{req.requester?.name}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Customer Site</span><span className="font-medium">{req.customer_site}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Delivery</span><span className="font-medium">{req.delivery_location}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Purpose</span><span className="font-medium">{req.purpose}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Date</span><span className="font-medium">{formatDate(req.created_at)}</span></div>
                            {req.remarks && <div className="pt-2 border-t"><p className="text-sm text-blue-600">{req.remarks}</p></div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Manager Decision</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Manager Comments {data.action === 'reject' && <span className="text-red-500">*</span>}</label>
                                <Textarea value={data.manager_comments} onChange={e => setData('manager_comments', e.target.value)} placeholder="Approval notes or rejection reason..." rows={4} />
                                {errors.manager_comments && <p className="text-sm text-red-500 mt-1">{errors.manager_comments}</p>}
                            </div>
                            <Alert variant="warning"><AlertTitle>Important</AlertTitle><AlertDescription>Approving locks this request for dispatch. Rejecting returns it to draft.</AlertDescription></Alert>
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => handleSubmit('approve')} disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle className="h-4 w-4 mr-2" /> Approve</Button>
                                <Button onClick={() => handleSubmit('reject')} disabled={processing} variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-2" /> Reject</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Qty Requested</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {req.lineItems?.map(li => (
                                    <TableRow key={li.id}><TableCell>{li.product?.name}</TableCell><TableCell className="font-mono text-xs">{li.product?.sku}</TableCell><TableCell className="text-right">{li.qty_requested}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
