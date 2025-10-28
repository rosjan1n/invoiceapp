"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Invoice from "@/app/(dashboard)/invoices/invoice";
import { InvoiceType } from "@/types/db";
import { FileText, Mail, Calendar, DollarSign, Hash } from "lucide-react";
import BulkActions from "@/app/shared/components/bulk-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function InvoicesTable({
  invoices,
  offset = 0,
}: {
  invoices: InvoiceType[];
  offset?: number;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useRouter();

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const response = await fetch("/api/invoice/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          invoiceIds: ids,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoices");
      }

      const result = await response.json();
      toast.success(result.message);
      router.refresh();
      return result;
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Błąd podczas usuwania faktur");
      throw error;
    }
  };

  const handleBulkExport = async (ids: string[]) => {
    try {
      const response = await fetch("/api/invoice/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "export",
          invoiceIds: ids,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export invoices");
      }

      const result = await response.json();
      toast.success(result.message);
      return result;
    } catch (error) {
      console.error("Bulk export error:", error);
      toast.error("Błąd podczas eksportowania faktur");
      throw error;
    }
  };

  const handleBulkSend = async (ids: string[]) => {
    try {
      const response = await fetch("/api/invoice/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendEmails",
          invoiceIds: ids,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send emails");
      }

      const result = await response.json();
      toast.success(result.message);
      return result;
    } catch (error) {
      console.error("Bulk send error:", error);
      toast.error("Błąd podczas wysyłania emaili");
      throw error;
    }
  };

  const handleBulkMarkAsPaid = async (ids: string[]) => {
    try {
      const response = await fetch("/api/invoice/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "markAsPaid",
          invoiceIds: ids,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark invoices as paid");
      }

      const result = await response.json();
      toast.success(result.message);
      router.refresh();
      return result;
    } catch (error) {
      console.error("Bulk mark as paid error:", error);
      toast.error("Błąd podczas oznaczania faktur jako opłacone");
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <BulkActions
        items={invoices}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkSend={handleBulkSend}
        onBulkMarkAsPaid={handleBulkMarkAsPaid}
        getItemId={(invoice) => invoice.id}
        getItemName={(invoice) => invoice.invoiceId}
      />

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-0">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedItems.length === invoices.length &&
                    invoices.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems(invoices.map((invoice) => invoice.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  Numer
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  E-mail
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Wartość brutto
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Data wystawienia
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground py-4 text-right">
                <span className="sr-only">Akcje</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <Invoice
                key={invoice.id}
                invoice={invoice}
                index={offset + index}
                isSelected={selectedItems.includes(invoice.id)}
                onSelectionChange={(selected) => {
                  if (selected) {
                    setSelectedItems((prev) => [...prev, invoice.id]);
                  } else {
                    setSelectedItems((prev) =>
                      prev.filter((id) => id !== invoice.id)
                    );
                  }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default InvoicesTable;
