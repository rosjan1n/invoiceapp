"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";

export default function ConfirmInvoice({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const response = await axios.post("/api/invoice/confirm", {
          token,
        });

        setIsConfirmed(true);
        toast.success(
          response.data.message ||
            "Faktura została oznaczona jako opłacona! Dziękujemy za płatność."
        );
      } catch (error: any) {
        console.error("Error confirming invoice:", error);

        // Obsługa różnych typów błędów
        if (error.response?.data?.error) {
          toast.error(error.response.data.message || error.response.data.error);
        } else if (error.response?.status === 404) {
          toast.error(
            "Faktura nie została znaleziona. Sprawdź czy link jest prawidłowy."
          );
        } else if (error.response?.status === 409) {
          toast.error(
            "Ta faktura została już wcześniej potwierdzona jako opłacona."
          );
        } else if (error.response?.status === 410) {
          toast.error("Faktura jest zbyt stara i nie może być potwierdzona.");
        } else {
          toast.error(
            "Wystąpił błąd w trakcie wysyłania potwierdzenia do wystawcy faktury. Spróbuj ponownie później."
          );
        }
      }
    });
  };

  if (isConfirmed) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
            Płatność potwierdzona!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Dziękujemy za potwierdzenie płatności
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={handleConfirm}
        disabled={isPending}
        className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-slate-50 dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-slate-200 text-white dark:text-slate-900 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Potwierdzanie...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Potwierdź płatność
          </>
        )}
      </Button>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 shadow-sm">
        <p className="text-xs text-amber-800 dark:text-amber-200 text-center font-medium">
          ⚠️ Ta akcja jest nieodwracalna
        </p>
      </div>
    </div>
  );
}
