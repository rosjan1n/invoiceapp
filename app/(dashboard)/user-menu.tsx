"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { toast } from "sonner";
import {
  Settings,
  LogOut,
  User as UserIcon,
  CreditCard,
  HelpCircle,
} from "lucide-react";

function UserMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors justify-start"
        >
          <div className="relative">
            <Image
              src={user?.image ?? "/placeholder-user.jpg"}
              width={32}
              height={32}
              alt="avatar"
              unoptimized
              className="rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {user?.name || "Użytkownik"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem asChild className="cursor-pointer px-2 py-2">
          <Link href={"/profile"} className="flex items-center gap-3 w-full">
            <UserIcon className="h-4 w-4 text-slate-500" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer px-2 py-2">
          <Link href={"/settings"} className="flex items-center gap-3 w-full">
            <Settings className="h-4 w-4 text-slate-500" />
            <span>Ustawienia</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer px-2 py-2">
          <Link href={"/billing"} className="flex items-center gap-3 w-full">
            <CreditCard className="h-4 w-4 text-slate-500" />
            <span>Płatności</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer px-2 py-2">
          <Link href={"/help"} className="flex items-center gap-3 w-full">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>Pomoc</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 px-2 py-2">
            <form
              action={() => {
                signOut({
                  callbackUrl: "/sign-in",
                }).then(() => {
                  toast.success("Pomyślnie wylogowano Cię.");
                });
              }}
              className="flex items-center gap-3 w-full"
            >
              <LogOut className="h-4 w-4" />
              <button type="submit" className="text-left">
                Wyloguj się
              </button>
            </form>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="cursor-pointer px-2 py-2">
            <Link href="/sign-in" className="flex items-center gap-3 w-full">
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span>Zaloguj się</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
