"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Trash2,
  Download,
  Mail,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkActionsProps<T> {
  items: T[];
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkExport?: (ids: string[]) => Promise<void>;
  onBulkSend?: (ids: string[]) => Promise<void>;
  onBulkMarkAsPaid?: (ids: string[]) => Promise<void>;
  getItemId: (item: T) => string;
  getItemName?: (item: T) => string;
  className?: string;
  disabled?: boolean;
}

export default function BulkActions<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkSend,
  onBulkMarkAsPaid,
  getItemId,
  getItemName,
  className,
  disabled = false,
}: BulkActionsProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = selectedItems.length === items.length && items.length > 0;
  const someSelected =
    selectedItems.length > 0 && selectedItems.length < items.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(getItemId));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkAction = async (
    action: (ids: string[]) => Promise<void>,
    actionName: string
  ) => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    try {
      await action(selectedItems);
      toast.success(
        `${actionName} wykonane pomyślnie dla ${selectedItems.length} elementów`
      );
      onSelectionChange([]);
    } catch (error) {
      toast.error(`Błąd podczas ${actionName.toLowerCase()}`);
      console.error(`Bulk ${actionName} error:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    if (onBulkDelete) {
      handleBulkAction(onBulkDelete, "Usuwanie");
    }
    setIsDeleteDialogOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 p-4 bg-muted/50 rounded-lg border",
          className
        )}
      >
        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            disabled={disabled}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Zaznacz wszystkie
          </label>
        </div>

        {/* Selection Info */}
        {selectedItems.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {selectedItems.length} z {items.length} zaznaczonych
          </Badge>
        )}

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
              disabled={disabled || isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              Anuluj
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled || isProcessing}
                  className="flex items-center gap-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Akcje ({selectedItems.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onBulkMarkAsPaid && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleBulkAction(
                        onBulkMarkAsPaid,
                        "Oznaczanie jako opłacone"
                      )
                    }
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Oznacz jako opłacone
                  </DropdownMenuItem>
                )}
                {onBulkSend && (
                  <DropdownMenuItem
                    onClick={() => handleBulkAction(onBulkSend, "Wysyłanie")}
                    disabled={isProcessing}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Wyślij emaile
                  </DropdownMenuItem>
                )}
                {onBulkExport && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleBulkAction(onBulkExport, "Eksportowanie")
                    }
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Eksportuj
                  </DropdownMenuItem>
                )}
                {onBulkDelete && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isProcessing}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Usuń
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potwierdź usunięcie
            </AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć {selectedItems.length} zaznaczonych
              elementów? Ta akcja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
