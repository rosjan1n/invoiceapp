"use client";

import React, { useState } from "react";
import {
  PanelLeft,
  Settings,
  Users2,
  FileText,
  BarChart3,
  Plus,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import UserMenu from "./user-menu";
import { User } from "next-auth";

export default function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const navItems = [
    { href: "/invoices", label: "Faktury", icon: FileText },
    { href: "/clients", label: "Klienci", icon: Users2 },
    { href: "/analytics", label: "Analityka", icon: BarChart3 },
    { href: "/settings", label: "Ustawienia", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Fakturly
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    System fakturowania
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Link
              href="/invoices/create"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
              onClick={handleLinkClick}
            >
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Nowa faktura</span>
                <span className="text-xs text-blue-100">
                  Utwórz nową fakturę
                </span>
              </div>
            </Link>

            <Link
              href="/clients/create"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all duration-200 border border-slate-200 hover:border-slate-300"
              onClick={handleLinkClick}
            >
              <div className="h-8 w-8 bg-slate-200 rounded-lg flex items-center justify-center">
                <Users2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Nowy klient</span>
                <span className="text-xs text-slate-500">
                  Dodaj nowego klienta
                </span>
              </div>
            </Link>
          </div>

          {/* User Menu */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <UserMenu user={user} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
