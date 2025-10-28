"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  Users2,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Receipt,
} from "lucide-react";
import React from "react";

export default function DashboardBreadCrumb() {
  const pathname = usePathname();
  const pathNames = pathname.split("/").filter((path) => path);

  const convertPathNames = (
    path: string,
    index: number,
    allPaths: string[]
  ) => {
    // Sprawdź czy to dynamiczny segment ID faktury
    if (path.length > 15 && allPaths[index - 1] === "invoices") {
      return "Szczegóły faktury";
    }

    switch (path) {
      case "clients":
        return "Klienci";
      case "invoices":
        return "Faktury";
      case "create":
        // Sprawdź kontekst - czy to tworzenie klienta czy faktury
        if (allPaths[index - 1] === "clients") {
          return "Nowy klient";
        } else if (allPaths[index - 1] === "invoices") {
          return "Nowa faktura";
        }
        return "Kreator";
      case "settings":
        return "Ustawienia";
      case "analytics":
        return "Analityka";
      default:
        return path;
    }
  };

  const getPathIcon = (path: string, index: number, allPaths: string[]) => {
    switch (path) {
      case "clients":
        return <Users2 className="h-3 w-3" />;
      case "invoices":
        return <Receipt className="h-3 w-3" />;
      case "create":
        return <Plus className="h-3 w-3" />;
      case "settings":
        return <Settings className="h-3 w-3" />;
      case "analytics":
        return <BarChart3 className="h-3 w-3" />;
      default:
        // Sprawdź czy to ID faktury
        if (path.length > 15 && allPaths[index - 1] === "invoices") {
          return <FileText className="h-3 w-3" />;
        }
        return null;
    }
  };

  return (
    <Breadcrumb className="flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href={"/invoices"}
            className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <span>Fakturly</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathNames.map((path, index) => {
          // Pomiń "invoices" jeśli to pierwszy element, bo już mamy "Fakturly"
          if (index === 0 && path === "invoices") {
            return null;
          }

          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathNames.length - 1;
          const icon = getPathIcon(path, index, pathNames);
          const displayName = convertPathNames(path, index, pathNames);

          return (
            <div key={index} className="contents">
              <BreadcrumbSeparator className="text-slate-400 dark:text-slate-500" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={href}
                  className={`flex items-center gap-2 transition-colors text-sm ${
                    isLast
                      ? "text-slate-900 dark:text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  }`}
                >
                  {icon}
                  <span>{displayName}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
