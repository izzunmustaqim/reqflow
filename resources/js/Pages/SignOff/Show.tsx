import React, { useRef, useState, useCallback } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { type SignOffShowProps } from '@/types';
import { formatDate } from '@/lib/utils';
import { Pen, Camera, CheckCircle } from 'lucide-react';

export default function SignOffShow({ sampleRequest: req }: SignOffShowProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        signer_name: '',
        role: '',
        signature_data: '',
        stamp_photo: null as File | null,
    });

    const getCanvasCoords = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    }, []);

    const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoords(e);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    }, [isDrawing]);

    const endDraw = useCallback(() => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            setData('signature_data', canvas.toDataURL('image/png'));
        }
    }, []);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        setData('signature_data', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasSignature || !data.signature_data) return;
        const formData = new FormData();
        formData.append('signer_name', data.signer_name);
        formData.append('role', data.role);
        formData.append('signature_data', data.signature_data);
        if (data.stamp_photo) formData.append('stamp_photo', data.stamp_photo);

        post(`/sign-off/${req.id}`, { forceFormData: true });
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customer Sign-Off</h1>
                    <p className="text-sm text-zinc-500">Request: {req.request_id}</p>
                </div>

                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertTitle className="text-blue-900">Compliance Acknowledgment</AlertTitle>
                            <AlertDescription className="text-blue-800">
                                By signing below, I acknowledge receipt of the Fresubin sample products listed. I confirm that these samples will be used solely for the stated purpose and in accordance with the applicable regulatory guidelines. I understand that this signature constitutes a binding record of product receipt.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Received Products</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Batch</TableHead><TableHead className="text-right">Qty</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {req.lineItems?.map(li => (
                                    <TableRow key={li.id}>
                                        <TableCell>{li.product?.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{li.product?.sku}</TableCell>
                                        <TableCell className="font-mono text-xs">{li.inventoryBatch?.batch_no}</TableCell>
                                        <TableCell className="text-right">{li.qty_dispatched}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader><CardTitle>Sign-Off Form</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Signer Name *</label>
                                    <Input value={data.signer_name} onChange={e => setData('signer_name', e.target.value)} placeholder="Full name" required />
                                    {errors.signer_name && <p className="text-sm text-red-500 mt-1">{errors.signer_name}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Department / Role *</label>
                                    <Input value={data.role} onChange={e => setData('role', e.target.value)} placeholder="e.g. Dietitian, Ward Manager" required />
                                    {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Signature * (Draw below)</label>
                                <div className="border-2 border-dashed border-blue-300 rounded-lg bg-white overflow-hidden">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={200}
                                        className="w-full cursor-crosshair touch-none"
                                        onMouseDown={startDraw}
                                        onMouseMove={draw}
                                        onMouseUp={endDraw}
                                        onMouseLeave={endDraw}
                                        onTouchStart={startDraw}
                                        onTouchMove={draw}
                                        onTouchEnd={endDraw}
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={clearSignature}>Clear Signature</Button>
                                </div>
                                {errors.signature_data && <p className="text-sm text-red-500 mt-1">{errors.signature_data}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Corporate Stamp (Optional)</label>
                                <div className="flex items-center gap-3">
                                    <Input type="file" accept="image/*" capture="environment" onChange={e => setData('stamp_photo', e.target.files?.[0] || null)} className="flex-1" />
                                    <Camera className="h-5 w-5 text-blue-400" />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Upload or take a photo of the physical stamp</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Link href={`/requests/${req.id}`}><Button variant="outline" type="button">Cancel</Button></Link>
                        <Button type="submit" disabled={processing || !hasSignature} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {processing ? 'Processing...' : 'Complete Sign-Off'}
                        </Button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
