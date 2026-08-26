export interface User {
    id: number;
    name: string;
    email: string;
    role: 'sales_rep' | 'manager' | 'admin';
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    storage_requirement: string;
    is_active: boolean;
    available_stock: number;
}

export interface InventoryBatch {
    id: number;
    product_id: number;
    batch_no: string;
    expiry_date: string;
    on_hand: number;
    reserved: number;
    location: string;
    status: 'Active' | 'Expired';
    product?: Product;
    remaining: number;
    is_available: boolean;
}

export type SampleRequestStatus =
    | 'Draft'
    | 'Submitted'
    | 'Pending Approval'
    | 'Approved'
    | 'Dispatched'
    | 'Signed'
    | 'Closed';

export interface SampleLineItem {
    id: number;
    sample_request_id: number;
    product_id: number;
    inventory_batch_id: number | null;
    qty_requested: number;
    qty_dispatched: number | null;
    product?: Product;
    inventoryBatch?: InventoryBatch;
}

export interface SampleRequest {
    id: number;
    request_id: string;
    requester_id: number;
    customer_site: string;
    purpose: string;
    status: SampleRequestStatus;
    delivery_location: string;
    remarks: string | null;
    manager_comments: string | null;
    approved_at: string | null;
    dispatched_at: string | null;
    signed_at: string | null;
    created_at: string;
    requester?: User;
    lineItems?: SampleLineItem[];
    signOff?: SignOff;
    auditLogs?: AuditLog[];
}

export interface SignOff {
    id: number;
    sample_request_id: number;
    signer_name: string;
    role: string;
    signed_at: string;
    signature_path: string;
    stamp_path: string | null;
}

export interface AuditLog {
    id: number;
    event_type: string;
    actor_id: number;
    timestamp: string;
    payload_before_after: {
        before: Record<string, unknown> | null;
        after: Record<string, unknown> | null;
    };
    sample_request_id: number;
    actor?: User;
    sampleRequest?: SampleRequest;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
}

export interface DashboardProps extends PageProps {
    requests: PaginatedData<SampleRequest>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        dispatched: number;
        signed: number;
    };
    currentStatus: string;
}

export interface CreateRequestProps extends PageProps {
    products: Product[];
    availableBatches: InventoryBatch[];
}

export interface ShowRequestProps extends PageProps {
    sampleRequest: SampleRequest;
}

export interface ApprovalIndexProps extends PageProps {
    pendingRequests: PaginatedData<SampleRequest>;
}

export interface ApprovalShowProps extends PageProps {
    sampleRequest: SampleRequest;
}

export interface DispatchIndexProps extends PageProps {
    dispatchableRequests: PaginatedData<SampleRequest>;
}

export interface DispatchShowProps extends PageProps {
    sampleRequest: SampleRequest;
    availableBatches: InventoryBatch[];
}

export interface SignOffShowProps extends PageProps {
    sampleRequest: SampleRequest;
}

export interface AdminIndexProps extends PageProps {
    allRequests: PaginatedData<SampleRequest>;
    auditLogs: PaginatedData<AuditLog>;
}
