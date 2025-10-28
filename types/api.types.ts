import { ExtendedInvoice } from "./db";

// Re-export ExtendedInvoice
export type { ExtendedInvoice };

// Filtry dla faktur
export interface InvoiceFilters {
  search?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  sortBy?: "issuedAt" | "soldAt" | "totalAmount" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
  offset?: number;
}

// Odpowiedzi API z paginacją
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

// Typy dla formularzy API
export interface CreateInvoiceRequest {
  invoiceId: string;
  issuedAt: Date;
  soldAt: Date;
  clientId: string;
  products: ProductItem[];
  exemptTax: boolean;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  id: string;
}

// Typy dla produktów w fakturze
export interface ProductItem {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  vat: string;
}

// Typy dla statystyk
export interface InvoiceStats {
  total: number;
  paid: number;
  overdue: number;
  draft: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
}

// Typy dla eksportu
export interface ExportOptions {
  format: "pdf" | "excel" | "csv";
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}
