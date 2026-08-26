import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from '@/Components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select } from '@/Components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { type CreateRequestProps, type Product } from '@/types';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';

interface LineItem {
    product_id: string;
    qty_requested: string;
}

export default function CreateSampleRequest({ products }: CreateRequestProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [stockWarnings, setStockWarnings] = useState<Record<number, boolean>>({});

    const { data, setData, post, processing, errors } = useForm({
        customer_site: '',
        purpose: '',
        delivery_location: '',
        remarks: '',
        line_items: [{ product_id: '', qty_requested: '1' }] as LineItem[],
    });

    const productOptions = products.map((p: Product) => ({
        value: p.id.toString(),
        label: `${p.sku} - ${p.name}`,
    }));

    const addLineItem = () => {
        setData('line_items', [...data.line_items, { product_id: '', qty_requested: '1' }]);
    };

    const removeLineItem = (index: number) => {
        if (data.line_items.length <= 1) return;
        setData('line_items', data.line_items.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
        const updated = [...data.line_items];
        updated[index] = { ...updated[index], [field]: value };
        setData('line_items', updated);

        if (field === 'product_id' || field === 'qty_requested') {
            checkStock(updated[index], index);
        }
    };

    const checkStock = (item: LineItem, index: number) => {
        const productId = parseInt(item.product_id);
        const qty = parseInt(item.qty_requested);
        if (productId && qty) {
            const product = products.find((p: Product) => p.id === productId);
            if (product && product.available_stock < qty) {
                setStockWarnings(prev => ({ ...prev, [index]: true }));
                return;
            }
        }
        setStockWarnings(prev => ({ ...prev, [index]: false }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmSubmit = () => {
        post('/requests', { onSuccess: () => setShowConfirm(false) });
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">← Back to Dashboard</Link>
                    <h1 className="text-2xl font-bold tracking-tight">New Sample Request</h1>
                    <p className="text-sm text-zinc-500">Create a new Fresubin product sample request</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Customer Site *</label>
                                    <Input value={data.customer_site} onChange={e => setData('customer_site', e.target.value)} placeholder="e.g. Hospital Kuala Lumpur" />
                                    {errors.customer_site && <p className="text-sm text-red-500 mt-1">{errors.customer_site}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Delivery Location *</label>
                                    <Input value={data.delivery_location} onChange={e => setData('delivery_location', e.target.value)} placeholder="e.g. Ward 3B, Nutrition Dept" />
                                    {errors.delivery_location && <p className="text-sm text-red-500 mt-1">{errors.delivery_location}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Purpose *</label>
                                <Input value={data.purpose} onChange={e => setData('purpose', e.target.value)} placeholder="e.g. Product evaluation for dietitian review" />
                                {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Remarks</label>
                                <Textarea value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Additional notes or special instructions..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Products</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
                        </CardHeader>
                        <CardContent>
                            {errors['line_items'] && (
                                <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{errors['line_items'] as string}</AlertDescription></Alert>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="w-32">Quantity</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.line_items.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <TableRow>
                                                <TableCell>
                                                    <Select options={productOptions} value={item.product_id} onChange={e => updateLineItem(index, 'product_id', e.target.value)} placeholder="Select Fresubin product" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" min="1" value={item.qty_requested} onChange={e => updateLineItem(index, 'qty_requested', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)} disabled={data.line_items.length <= 1}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            {stockWarnings[index] && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="pb-2">
                                                        <Alert variant="warning"><AlertTriangle className="h-4 w-4" /><AlertTitle>Insufficient Stock</AlertTitle><AlertDescription>Requested quantity exceeds available inventory.</AlertDescription></Alert>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Link href="/dashboard"><Button variant="outline" type="button">Cancel</Button></Link>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white">Submit Request</Button>
                    </div>
                </form>

                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Submission</DialogTitle>
                            <DialogDescription>Submit this sample request for manager approval?</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Site:</span> {data.customer_site}</div>
                            <div><span className="font-medium">Purpose:</span> {data.purpose}</div>
                            <div><span className="font-medium">Products:</span> {data.line_items.length} line item(s)</div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                            <Button onClick={confirmSubmit} disabled={processing} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                {processing ? 'Submitting...' : 'Confirm & Submit'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
