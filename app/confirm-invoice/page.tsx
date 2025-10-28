import ConfirmInvoice from "./confirmInvoice";
import { Mail, CreditCard } from "lucide-react";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ConfirmInvoicePage({ searchParams }: PageProps) {
  const token = searchParams.token;
  const toEmail = searchParams.to;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light text-slate-900 dark:text-slate-50 tracking-wide">
            Fakturly
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-8 text-center space-y-8">
          {token && typeof token === "string" ? (
            <>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    Potwierdź płatność
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                    Kliknij poniżej, aby potwierdzić otrzymanie płatności za
                    fakturę
                  </p>
                </div>
              </div>
              <ConfirmInvoice token={token} />
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    Sprawdź e-mail
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                    {toEmail ? (
                      <>
                        Faktura została wysłana na adres{" "}
                        <span className="font-semibold text-slate-900 dark:text-slate-50">
                          {toEmail}
                        </span>
                      </>
                    ) : (
                      "Faktura została wysłana na twój adres e-mail"
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  💡 Sprawdź folder spam, jeśli nie widzisz wiadomości
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              © 2024 Fakturly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
