"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-lg border-0 shadow-xl bg-white dark:bg-slate-900">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-lg">
            <Search className="w-10 h-10 text-slate-500 dark:text-slate-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Strona nie została znaleziona
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Przepraszamy, ale strona której szukasz nie istnieje lub została
            przeniesiona.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              <Link href="/" className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Strona główna
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Jeśli uważasz, że to błąd, skontaktuj się z{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                pomocą techniczną
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
