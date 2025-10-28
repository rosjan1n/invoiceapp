"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceFilters } from "@/types/api.types";
import { useInvoices } from "@/app/shared/hooks/use-invoice";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  X,
  Plus,
  FileText,
  AlertCircle,
  Star,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function InvoicesDashboard({
  searchParams,
}: {
  searchParams: InvoiceFilters;
}) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { data, isLoading, error } = useInvoices(searchParams);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (
    key: keyof InvoiceFilters,
    value: string | undefined
  ) => {
    const params = new URLSearchParams(searchParamsHook.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset offset when filters change
    params.delete("offset");
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.delete("offset");
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/invoices");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: {
        label: "Opłacona",
        className:
          "!bg-green-100 !text-green-800 dark:!bg-green-900/20 dark:!text-green-400",
      },
      PENDING: {
        label: "Oczekująca",
        className:
          "!bg-blue-100 !text-blue-800 dark:!bg-blue-900/20 dark:!text-blue-400",
      },
      DRAFT: {
        label: "Szkic",
        className:
          "!bg-gray-100 !text-gray-800 dark:!bg-gray-900/20 dark:!text-gray-400",
      },
      UNPAID: {
        label: "Przeterminowana",
        className:
          "!bg-red-100 !text-red-800 dark:!bg-red-900/20 dark:!text-red-400",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <Badge
        className={cn(
          "px-2 py-1 text-xs font-medium rounded",
          config.className
        )}
      >
        {config.label}
      </Badge>
    );
  };

  const hasActiveFilters = Object.values(searchParams).some(
    (value) => value && value !== ""
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Faktury
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Zarządzaj swoimi fakturami i ich uprawnieniami tutaj.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data && data.pagination.total}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Wszystkich faktur
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Szukaj faktur, klientów, numerów..."
                className="pl-12 h-12 border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl text-base"
                value={searchParams.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Filters */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2 px-6 py-3 h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-all duration-200 ease-in-out",
                showFilters &&
                  "bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500 shadow-sm"
              )}
            >
              <Filter
                className={cn(
                  "h-5 w-5 transition-transform duration-200 ease-in-out",
                  showFilters && "rotate-180"
                )}
              />
              Filtry
              {hasActiveFilters && (
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Button>

            {/* Add Invoice */}
            <Button
              onClick={() => router.push("/invoices/create")}
              className="gap-2 px-6 py-3 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nowa faktura
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filtry
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4 mr-1" />
              Wyczyść wszystkie
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="transform transition-all duration-300 ease-in-out delay-75">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Status
              </label>
              <Select
                value={searchParams.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="rounded-xl dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue placeholder="Wybierz status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="PAID">Opłacona</SelectItem>
                  <SelectItem value="PENDING">Oczekująca</SelectItem>
                  <SelectItem value="DRAFT">Szkic</SelectItem>
                  <SelectItem value="UNPAID">Przeterminowana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="transform transition-all duration-300 ease-in-out delay-100">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Data od
              </label>
              <Input
                type="date"
                value={searchParams.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            {/* Date To Filter */}
            <div className="transform transition-all duration-300 ease-in-out delay-150">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Data do
              </label>
              <Input
                type="date"
                value={searchParams.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Table */}
      <Card className="border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Błąd ładowania
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {error.message || "Wystąpił błąd podczas pobierania faktur"}
                </p>
              </div>
            </div>
          ) : data && data.data ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800">
                    <TableRow className="border-b border-slate-200 dark:border-slate-700">
                      <TableHead className="w-12 px-6 py-4">
                        <Star className="h-4 w-4 text-slate-400" />
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          Numer
                          <SortAsc className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          Status
                          <SortAsc className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          Data
                          <SortAsc className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Klient
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          Kwota
                          <SortAsc className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          Do zapłaty
                          <SortAsc className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableHead>
                      <TableHead className="w-12 px-6 py-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((invoice, index) => (
                      <TableRow
                        key={invoice.id}
                        className={cn(
                          "border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200",
                          index === data.data.length - 1 &&
                            data.pagination.total > data.data.length &&
                            "opacity-50"
                        )}
                      >
                        <TableCell className="px-6 py-5">
                          <Star
                            className={cn(
                              "h-5 w-5 cursor-pointer transition-colors",
                              index === 4
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300 hover:text-yellow-400"
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                            {invoice.invoiceId}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          {getStatusBadge(invoice.status || "draft")}
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">
                            {invoice.issuedAt
                              ? format(
                                  new Date(invoice.issuedAt),
                                  "dd MMM yyyy",
                                  { locale: pl }
                                )
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {invoice.client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                              {invoice.client.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                            {invoice.products
                              ?.reduce(
                                (total, product) =>
                                  total + product.price * product.quantity,
                                0
                              )
                              .toFixed(2)}{" "}
                            zł
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                            {invoice.status === "PAID"
                              ? "0.00 zł"
                              : invoice.products
                                  ?.reduce(
                                    (total, product) =>
                                      total + product.price * product.quantity,
                                    0
                                  )
                                  .toFixed(2) + " zł"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-lg hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Podgląd
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edytuj
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Pobierz PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Wyślij e-mail
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Usuń
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination overlay like in image - only show when there are more items */}
              {data.data.length > 0 &&
                data.pagination.total > data.data.length && (
                  <div className="relative">
                    {/* Overlay pagination on top of table */}
                    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center py-4">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Pokaż
                            </span>
                            <Select defaultValue="10">
                              <SelectTrigger className="w-16 h-8 text-xs border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                                <SelectValue />
                                <ChevronDown className="h-3 w-3" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            z {data.pagination.total} wyników
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={data.data.length < 10}
                            onClick={() => {
                              const params = new URLSearchParams(
                                searchParamsHook.toString()
                              );
                              const newOffset = (searchParams.offset || 0) + 10;
                              params.set("offset", newOffset.toString());
                              router.push(`?${params.toString()}`);
                            }}
                            className="h-8 px-4 text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                          >
                            Pokaż więcej
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <FileText className="h-12 w-12 text-slate-400" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Brak faktur
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Nie masz jeszcze żadnych faktur.
                </p>
              </div>
              <Button
                onClick={() => router.push("/invoices/create")}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Stwórz pierwszą fakturę
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
