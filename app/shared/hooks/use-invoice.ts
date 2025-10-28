import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  InvoiceFilters,
  PaginatedResponse,
  ExtendedInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from "@/types/api.types";
import { toast } from "sonner";

// Hook do pobierania faktur
export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async (): Promise<PaginatedResponse<ExtendedInvoice>> => {
      const params = new URLSearchParams();

      // Dodaj filtry do parametrów URL
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.set("dateTo", filters.dateTo);
      if (filters?.clientId) params.set("clientId", filters.clientId);
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (filters?.offset) params.set("offset", filters.offset.toString());

      const response = await fetch(`/api/invoices?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      // Przekształć odpowiedź API na format PaginatedResponse
      return {
        data: apiResponse.invoices || [],
        pagination: {
          total: apiResponse.totalInvoices || 0,
          offset: filters?.offset || 0,
          limit: 10, // Stała wartość z API
        },
      };
    },
  });
};

// Hook do pobierania pojedynczej faktury
export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: async (): Promise<ExtendedInvoice> => {
      const response = await fetch(`/api/invoice/${invoiceId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!invoiceId, // Tylko jeśli invoiceId istnieje
  });
};

// Hook do tworzenia faktury
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      invoiceData: CreateInvoiceRequest
    ): Promise<ExtendedInvoice> => {
      const response = await fetch("/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create invoice");
      }

      return response.json();
    },
    onSuccess: () => {
      // Inwalidacja cache po udanym utworzeniu
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Faktura została pomyślnie utworzona!");
    },
    onError: (error: Error) => {
      toast.error(`Błąd podczas tworzenia faktury: ${error.message}`);
    },
  });
};

// Hook do aktualizacji faktury
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...invoiceData
    }: UpdateInvoiceRequest): Promise<ExtendedInvoice> => {
      const response = await fetch(`/api/invoice/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update invoice");
      }

      return response.json();
    },
    onSuccess: (updatedInvoice) => {
      // Aktualizacja cache z nowymi danymi
      queryClient.setQueryData(["invoices", updatedInvoice.id], updatedInvoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Faktura została pomyślnie zaktualizowana!");
    },
    onError: (error: Error) => {
      toast.error(`Błąd podczas aktualizacji faktury: ${error.message}`);
    },
  });
};

// Hook do usuwania faktury
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string): Promise<void> => {
      const response = await fetch(`/api/invoice/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete invoice");
      }
    },
    onSuccess: (_, invoiceId) => {
      // Usunięcie z cache
      queryClient.removeQueries({ queryKey: ["invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Faktura została pomyślnie usunięta!");
    },
    onError: (error: Error) => {
      toast.error(`Błąd podczas usuwania faktury: ${error.message}`);
    },
  });
};

// Hook do masowego usuwania faktur
export const useBulkDeleteInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceIds: string[]): Promise<void> => {
      const response = await fetch("/api/invoice/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: invoiceIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete invoices");
      }
    },
    onSuccess: (_, invoiceIds) => {
      // Usunięcie z cache
      invoiceIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: ["invoices", id] });
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(
        `${invoiceIds.length} faktur zostało pomyślnie usuniętych!`
      );
    },
    onError: (error: Error) => {
      toast.error(`Błąd podczas usuwania faktur: ${error.message}`);
    },
  });
};
