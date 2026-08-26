import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { type ShowRequestProps } from '@/types';
import { formatDateTime, statusColor } from '@/lib/utils';
import { CheckCircle, Printer } from 'lucide-react';

export default function Receipt({ sampleRequest: req }: ShowRequestProps) {
    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold tracking-tight">Sign-Off Complete</h1>
                    <p className="text-sm text-zinc-500">Sample receipt has been verified and recorded</p>
                </div>

                <Card className="border-2 border-emerald-200">
                    <CardHeader className="text-center border-b border-emerald-100">
                        <CardTitle className="text-lg">SAMPLE RECEIPT — {req.request_id}</CardTitle>
                        <Badge className={statusColor(req.status)}>{req.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-zinc-500">Customer Site</span><p className="font-medium">{req.customer_site}</p></div>
                            <div><span className="text-zinc-500">Delivery Location</span><p className="font-medium">{req.delivery_location}</p></div>
                            <div><span className="text-zinc-500">Requester</span><p className="font-medium">{req.requester?.name}</p></div>
                            <div><span className="text-zinc-500">Purpose</span><p className="font-medium">{req.purpose}</p></div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Products Received</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {req.lineItems?.map(li => (
                                        <TableRow key={li.id}>
                                            <TableCell className="text-sm">{li.product?.name} <span className="text-xs text-zinc-500 font-mono">({li.product?.sku})</span></TableCell>
                                            <TableCell className="font-mono text-xs">{li.inventoryBatch?.batch_no}</TableCell>
                                            <TableCell className="text-sm">{li.inventoryBatch?.expiry_date}</TableCell>
                                            <TableCell className="text-right">{li.qty_dispatched}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {req.signOff && (
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium mb-2">Sign-Off Verification</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-zinc-500">Signer</span><p className="font-medium">{req.signOff.signer_name}</p></div>
                                    <div><span className="text-zinc-500">Role</span><p className="font-medium">{req.signOff.role}</p></div>
                                    <div><span className="text-zinc-500">Signed At</span><p className="font-medium">{formatDateTime(req.signOff.signed_at)}</p></div>
                                </div>
                                <div className="flex justify-center gap-8 mt-4">
                                    {req.signOff.signature_path && (
                                        <div className="text-center"><p className="text-xs text-zinc-500 mb-1">Signature</p><img src={`/storage/${req.signOff.signature_path}`} alt="Signature" className="h-20 border rounded bg-white px-2" /></div>
                                    )}
                                    {req.signOff.stamp_path && (
                                        <div className="text-center"><p className="text-xs text-zinc-500 mb-1">Corporate Stamp</p><img src={`/storage/${req.signOff.stamp_path}`} alt="Stamp" className="h-20 border rounded bg-white px-2" /></div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print Receipt</Button>
                    <Link href="/dashboard"><Button>Return to Dashboard</Button></Link>
                </div>
            </div>
        </Layout>
    );
}
