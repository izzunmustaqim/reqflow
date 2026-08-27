import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { type DispatchShowProps, type SampleLineItem, type InventoryBatch } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { Search, ChevronDown } from 'lucide-react';

interface Allocation {
    line_item_id: number;
    inventory_batch_id: string;
    qty_dispatched: string;
}

export default function DispatchShow({ sampleRequest: req, availableBatches }: DispatchShowProps) {
    const { toast } = useToast();
    const [showConfirm, setShowConfirm] = useState(false);
    const [openPopover, setOpenPopover] = useState<number | null>(null);
    const [batchSearch, setBatchSearch] = useState('');

    const { data, setData, post, processing, errors } = useForm<{
        allocations: Allocation[];
    }>({
        allocations: req.lineItems?.map((li: SampleLineItem) => ({
            line_item_id: li.id,
            inventory_batch_id: '',
            qty_dispatched: li.qty_requested.toString(),
        })) || [],
    });

    const getBatchesForProduct = (productId: number): InventoryBatch[] => {
        return availableBatches.filter((b: InventoryBatch) => b.product_id === productId);
    };

    const updateAllocation = (index: number, field: keyof Allocation, value: string) => {
        const updated = [...data.allocations];
        updated[index] = { ...updated[index], [field]: value };
        setData('allocations', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hasEmpty = data.allocations.some(a => !a.inventory_batch_id || !a.qty_dispatched);
        if (hasEmpty) {
            toast('Please select a batch and quantity for all line items.', 'error');
            return;
        }
        setShowConfirm(true);
    };

    const confirmDispatch = () => {
        post(`/dispatch/${req.id}`, {
            onSuccess: () => {
                setShowConfirm(false);
                toast('Sample dispatched successfully!', 'success');
            },
            onError: () => toast('Dispatch failed. Check batch allocations.', 'error'),
        });
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Link href="/dispatch" className="text-sm text-zinc-500 hover:text-zinc-700 mb-2 inline-block">← Back to Dispatch</Link>
                    <h1 className="text-2xl font-bold tracking-tight">Dispatch: {req.request_id}</h1>
                    <p className="text-sm text-zinc-500">{req.customer_site} — {req.requester?.name}</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Batch Allocation</CardTitle></CardHeader>
                    <CardContent>
                        <Alert variant="warning" className="mb-4">
                            <AlertTitle>Batch Rules</AlertTitle>
                            <AlertDescription>Only active batches with expiry ≥ 30 days are shown. Dispatched quantities will be deducted from inventory.</AlertDescription>
                        </Alert>

                        <form onSubmit={handleSubmit}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-right">Qty Requested</TableHead>
                                        <TableHead>Select Batch</TableHead>
                                        <TableHead className="w-28">Qty to Dispatch</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {req.lineItems?.map((li: SampleLineItem, index: number) => {
                                        const batches = getBatchesForProduct(li.product_id);
                                        const selectedBatch = batches.find((b: InventoryBatch) => b.id.toString() === data.allocations[index]?.inventory_batch_id);

                                        return (
                                            <TableRow key={li.id}>
                                                <TableCell>{li.product?.name}</TableCell>
                                                <TableCell className="font-mono text-xs">{li.product?.sku}</TableCell>
                                                <TableCell className="text-right">{li.qty_requested}</TableCell>
                                                <TableCell>
                                                    <Popover open={openPopover === li.id} onOpenChange={(open) => setOpenPopover(open ? li.id : null)}>
                                                        <PopoverTrigger className="w-full">
                                                            <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-white hover:bg-blue-50">
                                                                <span className={selectedBatch ? 'text-blue-900' : 'text-blue-400'}>
                                                                    {selectedBatch ? `${selectedBatch.batch_no} (${selectedBatch.remaining} avail)` : 'Select batch...'}
                                                                </span>
                                                                <ChevronDown className="h-4 w-4 text-blue-400" />
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent open={openPopover === li.id} className="w-80">
                                                            <Command>
                                                                <CommandInput placeholder="Search batches..." value={batchSearch} onChange={setBatchSearch} />
                                                                <CommandList>
                                                                    <CommandEmpty>No batches available.</CommandEmpty>
                                                                    <CommandGroup heading="Available Batches">
                                                                        {batches.filter((b: InventoryBatch) => b.batch_no.toLowerCase().includes(batchSearch.toLowerCase())).map((batch: InventoryBatch) => (
                                                                            <CommandItem key={batch.id} onSelect={() => { updateAllocation(index, 'inventory_batch_id', batch.id.toString()); setOpenPopover(null); setBatchSearch(''); }}>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-mono text-xs">{batch.batch_no}</span>
                                                                                    <span className="text-xs text-blue-500">Avail: {batch.remaining} | Exp: {formatDate(batch.expiry_date)}</span>
                                                                                </div>
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" min="1" max={selectedBatch?.remaining || li.qty_requested} value={data.allocations[index]?.qty_dispatched || ''} onChange={e => updateAllocation(index, 'qty_dispatched', e.target.value)} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end gap-3 mt-6">
                                <Link href="/dispatch"><Button variant="outline" type="button">Cancel</Button></Link>
                                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">Confirm Dispatch</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Confirm Dispatch</DialogTitle></DialogHeader>
                        <p className="text-sm text-blue-600">This will deduct inventory and lock the request. Proceed?</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                            <Button onClick={confirmDispatch} disabled={processing} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                {processing ? 'Dispatching...' : 'Dispatch Now'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
