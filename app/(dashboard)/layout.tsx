import React from "react";
import NavItem from "@/app/(dashboard)/nav-item";
import {
  Settings,
  Users2,
  FileText,
  BarChart3,
  Plus,
  User,
  LogOut,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import Providers from "@/app/(dashboard)/providers";
import DashboardBreadCrumb from "./breadcrumb";
import UserMenu from "./user-menu";
import { ModeToggle } from "./mode-toggle";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MobileNav from "./mobile-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user) return redirect("/sign-in");

  return (
    <Providers>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          <DesktopNav user={session.user} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
              <div className="max-w-7xl mx-auto p-8">{children}</div>
            </main>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-screen">
          <MobileHeader user={session.user} />
          <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="p-4">{children}</div>
          </main>
        </div>
      </div>
    </Providers>
  );
}

function DesktopNav({ user }: { user: any }) {
  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Fakturly
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              System fakturowania
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          GŁÓWNE
        </h3>
        <nav className="space-y-1">
          <NavItem href="/invoices" label="Faktury" isActive>
            <FileText className="h-4 w-4" />
          </NavItem>
          <NavItem href="/clients" label="Klienci">
            <Users2 className="h-4 w-4" />
          </NavItem>
          <NavItem href="/analytics" label="Analityka">
            <BarChart3 className="h-4 w-4" />
          </NavItem>
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          SZYBKIE AKCJE
        </h3>
        <div className="space-y-2">
          <Link
            href="/invoices/create"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Nowa faktura</span>
              <span className="text-xs text-blue-100">Utwórz nową fakturę</span>
            </div>
          </Link>

          <Link
            href="/clients/create"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
          >
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
              <Users2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Nowy klient</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Dodaj nowego klienta
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-6 py-4 border-t border-slate-200 dark:border-slate-700">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <DashboardBreadCrumb />
      </div>

      <div className="flex items-center gap-4">
        {/* Enhanced Theme Toggle */}
        <ModeToggle />
      </div>
    </header>
  );
}

function MobileHeader({ user }: { user: any }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MobileNav user={user} />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-lg font-bold text-white">F</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Fakturly
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <User />
      </div>
    </header>
  );
}
