"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Filter,
  Search,
  Calendar as CalendarIcon,
  SortAsc,
  ChevronDown,
  Check,
  RotateCcw,
  Clock,
  Save,
  Bookmark,
  Plus,
  Minus,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { pl } from "date-fns/locale";
import RateLimitIndicator from "./rate-limit-indicator";

export interface FilterState {
  search: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  presets?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: Partial<FilterState>;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  className?: string;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showSortFilter?: boolean;
  placeholder?: string;
  showPresets?: boolean;
  showAdvancedSearch?: boolean;
  showRateLimit?: boolean;
  apiEndpoint?: string;
}

// Presetowe filtry
const filterPresets: FilterPreset[] = [
  {
    id: "today",
    name: "Dzisiaj",
    description: "Faktury z dzisiejszego dnia",
    icon: Clock,
    filters: {
      dateFrom: format(new Date(), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    },
  },
  {
    id: "yesterday",
    name: "Wczoraj",
    description: "Faktury z wczoraj",
    icon: Clock,
    filters: {
      dateFrom: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      dateTo: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    },
  },
  {
    id: "last7days",
    name: "Ostatnie 7 dni",
    description: "Faktury z ostatniego tygodnia",
    icon: CalendarIcon,
    filters: {
      dateFrom: format(subDays(new Date(), 7), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    },
  },
  {
    id: "last30days",
    name: "Ostatnie 30 dni",
    description: "Faktury z ostatniego miesiąca",
    icon: CalendarIcon,
    filters: {
      dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    },
  },
  {
    id: "unpaid",
    name: "Nieopłacone",
    description: "Tylko nieopłacone faktury",
    icon: X,
    filters: {
      status: "UNPAID",
    },
  },
  {
    id: "pending",
    name: "Oczekujące",
    description: "Faktury oczekujące na płatność",
    icon: Clock,
    filters: {
      status: "PENDING",
    },
  },
];

export default function Filters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  showStatusFilter = true,
  showDateFilter = true,
  showSortFilter = true,
  placeholder = "Szukaj...",
  showPresets = true,
  showAdvancedSearch = true,
  showRateLimit = true,
  apiEndpoint = "/api/invoices",
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "dateRange") return false; // dateRange jest obsługiwane osobno
      return value && value !== "" && value !== undefined;
    });
  }, [filters]);

  const updateFilter = (
    key: keyof FilterState,
    value: string | Date | { from?: Date; to?: Date }
  ) => {
    // Konwertuj wartości "all" i "default" na undefined
    const normalizedValue =
      value === "all" || value === "default" ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: normalizedValue || undefined,
    });
  };

  const clearFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({
      ...filters,
      ...preset.filters,
      presets: preset.id,
    });
    setIsPresetOpen(false);
  };

  const handleDateRangeSelect = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: { from: range.from, to: range.to },
        dateFrom: format(range.from, "yyyy-MM-dd"),
        dateTo: format(range.to, "yyyy-MM-dd"),
      });
    } else if (range?.from) {
      onFiltersChange({
        ...filters,
        dateRange: { from: range.from, to: undefined },
        dateFrom: format(range.from, "yyyy-MM-dd"),
        dateTo: undefined,
      });
    }
    setIsDatePickerOpen(false);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PAID: "Opłacone",
      PENDING: "Oczekujące",
      UNPAID: "Nieopłacone",
    };
    return statusMap[status] || status;
  };

  const getSortLabel = (sortBy: string) => {
    const sortMap: Record<string, string> = {
      createdAt: "Data utworzenia",
      issuedAt: "Data wystawienia",
      invoiceId: "Numer faktury",
      status: "Status",
    };
    return sortMap[sortBy] || sortBy;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Rate Limit Indicator - ukryty dla użytkownika */}
      {showRateLimit && process.env.NODE_ENV === "development" && (
        <RateLimitIndicator
          endpoint={apiEndpoint}
          showDetails={false}
          className="mb-4"
        />
      )}

      {/* Advanced Search and Filter Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Top Row - Search and Quick Actions */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Advanced Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder={placeholder}
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-10 pr-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                />
                {showAdvancedSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIsAdvancedSearchOpen(!isAdvancedSearchOpen)
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Preset Filters */}
                {showPresets && (
                  <Popover open={isPresetOpen} onOpenChange={setIsPresetOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 px-4 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Szybkie filtry
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Szukaj presetów..." />
                        <CommandList>
                          <CommandEmpty>Nie znaleziono presetów.</CommandEmpty>
                          <CommandGroup heading="Presetowe filtry">
                            {filterPresets.map((preset) => {
                              const Icon = preset.icon;
                              return (
                                <CommandItem
                                  key={preset.id}
                                  onSelect={() => applyPreset(preset)}
                                  className="flex items-center gap-3 p-3 cursor-pointer"
                                >
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {preset.name}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                      {preset.description}
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Date Range Picker */}
                {showDateFilter && (
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 px-4 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateFrom && filters.dateTo
                          ? `${filters.dateFrom} - ${filters.dateTo}`
                          : "Zakres dat"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="text-sm font-medium">
                            Wybierz zakres dat
                          </div>
                          <Calendar
                            mode="range"
                            selected={filters.dateRange as any}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                            locale={pl}
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Main Filter Toggle */}
                <Button
                  variant={isExpanded ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    "h-12 px-4 transition-all duration-200",
                    isExpanded
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="font-medium">Wszystkie filtry</span>
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 p-0 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    >
                      {
                        Object.values(filters).filter((v) => v && v !== "")
                          .length
                      }
                    </Badge>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-2 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </Button>

                {/* Clear All Button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-12 px-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Wyczyść wszystko
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Zaawansowane filtry
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Dostosuj wyszukiwanie do swoich potrzeb
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Filter Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Status Filter */}
                {showStatusFilter && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          Status faktury
                        </label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Filtruj według statusu płatności
                        </p>
                      </div>
                    </div>
                    <Select
                      value={filters.status || "all"}
                      onValueChange={(value) => updateFilter("status", value)}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <SelectValue placeholder="Wybierz status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                            Wszystkie statusy
                          </div>
                        </SelectItem>
                        <SelectItem value="PAID">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            ✅ Opłacone
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            ⏳ Oczekujące
                          </div>
                        </SelectItem>
                        <SelectItem value="UNPAID">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            ❌ Nieopłacone
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sort Filter */}
                {showSortFilter && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <SortAsc className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          Sortowanie
                        </label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Uporządkuj wyniki
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Select
                        value={filters.sortBy || "default"}
                        onValueChange={(value) => updateFilter("sortBy", value)}
                      >
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                          <SelectValue placeholder="Wybierz kryterium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">🔄 Domyślne</SelectItem>
                          <SelectItem value="createdAt">
                            📅 Data utworzenia
                          </SelectItem>
                          <SelectItem value="issuedAt">
                            📋 Data wystawienia
                          </SelectItem>
                          <SelectItem value="invoiceId">
                            🔢 Numer faktury
                          </SelectItem>
                          <SelectItem value="status">📊 Status</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={filters.sortOrder || "desc"}
                        onValueChange={(value) =>
                          updateFilter("sortOrder", value as "asc" | "desc")
                        }
                      >
                        <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                          <SelectValue placeholder="Kierunek" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">⬇️ Malejąco</SelectItem>
                          <SelectItem value="asc">⬆️ Rosnąco</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                {showDateFilter && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          Zakres dat
                        </label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Wybierz okres wyszukiwania
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                          Data początkowa
                        </label>
                        <Input
                          type="date"
                          value={filters.dateFrom || ""}
                          onChange={(e) =>
                            updateFilter("dateFrom", e.target.value)
                          }
                          className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                          Data końcowa
                        </label>
                        <Input
                          type="date"
                          value={filters.dateTo || ""}
                          onChange={(e) =>
                            updateFilter("dateTo", e.target.value)
                          }
                          className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {hasActiveFilters ? (
                    <span>
                      Aktywnych filtrów:{" "}
                      {
                        Object.values(filters).filter((v) => v && v !== "")
                          .length
                      }
                    </span>
                  ) : (
                    <span>Brak aktywnych filtrów</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-slate-600 dark:text-slate-400"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Wyczyść
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Zastosuj filtry
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Active Filters Display */}
      {hasActiveFilters && (
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Aktywne filtry
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {
                        Object.values(filters).filter((v) => v && v !== "")
                          .length
                      }{" "}
                      filtrów zastosowanych
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Wyczyść wszystkie
                </Button>
              </div>

              {/* Filter Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filters.search && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-200 dark:bg-blue-800 rounded">
                          <Search className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Wyszukiwanie
                          </div>
                          <div className="font-semibold truncate max-w-[120px]">
                            "{filters.search}"
                          </div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-blue-900 dark:hover:text-blue-100"
                        onClick={() => clearFilter("search")}
                      />
                    </Badge>
                  </div>
                )}

                {filters.status && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-200 dark:bg-green-800 rounded">
                          <Check className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Status
                          </div>
                          <div className="font-semibold">
                            {getStatusLabel(filters.status)}
                          </div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-green-900 dark:hover:text-green-100"
                        onClick={() => clearFilter("status")}
                      />
                    </Badge>
                  </div>
                )}

                {filters.dateFrom && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-200 dark:bg-purple-800 rounded">
                          <CalendarIcon className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Data od
                          </div>
                          <div className="font-semibold">
                            {filters.dateFrom}
                          </div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-purple-900 dark:hover:text-purple-100"
                        onClick={() => clearFilter("dateFrom")}
                      />
                    </Badge>
                  </div>
                )}

                {filters.dateTo && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-200 dark:bg-purple-800 rounded">
                          <CalendarIcon className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Data do
                          </div>
                          <div className="font-semibold">{filters.dateTo}</div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-purple-900 dark:hover:text-purple-100"
                        onClick={() => clearFilter("dateTo")}
                      />
                    </Badge>
                  </div>
                )}

                {filters.sortBy && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-orange-200 dark:bg-orange-800 rounded">
                          <SortAsc className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Sortowanie
                          </div>
                          <div className="font-semibold">
                            {getSortLabel(filters.sortBy)}
                          </div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-orange-900 dark:hover:text-orange-100"
                        onClick={() => clearFilter("sortBy")}
                      />
                    </Badge>
                  </div>
                )}

                {filters.sortOrder && (
                  <div className="group relative">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-3 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-all duration-200 w-full justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-indigo-200 dark:bg-indigo-800 rounded">
                          <SortAsc className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            Kierunek
                          </div>
                          <div className="font-semibold">
                            {filters.sortOrder === "asc"
                              ? "Rosnąco"
                              : "Malejąco"}
                          </div>
                        </div>
                      </div>
                      <X
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-indigo-900 dark:hover:text-indigo-100"
                        onClick={() => clearFilter("sortOrder")}
                      />
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
