"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";

const NavItem = ({
  href,
  label,
  children,
  isActive: forceActive,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = forceActive || pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
        {
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white":
            isActive,
          "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800":
            !isActive,
        }
      )}
    >
      <div
        className={clsx("transition-colors", {
          "text-slate-900 dark:text-white": isActive,
          "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white":
            !isActive,
        })}
      >
        {children}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default NavItem;
