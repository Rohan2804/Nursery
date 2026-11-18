"use client";

import { Boxes, ExternalLink, FolderTree, History, LayoutDashboard, LogOut, Menu, Palette, Sprout, Upload, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Admin, Role } from "@/lib/auth";
import { cn } from "@/lib/cn";

const rank: Record<Role, number> = { staff: 1, manager: 2, owner: 3 };

const NAV: { href: string; label: string; icon: typeof Sprout; min: Role }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, min: "staff" },
  { href: "/plants", label: "Plants", icon: Sprout, min: "staff" },
  { href: "/inventory", label: "Inventory", icon: Boxes, min: "staff" },
  { href: "/collections", label: "Collections", icon: FolderTree, min: "staff" },
  { href: "/planters", label: "Planters", icon: Palette, min: "manager" },
  { href: "/import", label: "Import / export", icon: Upload, min: "manager" },
  { href: "/activity", label: "Activity", icon: History, min: "staff" },
  { href: "/team", label: "Team", icon: Users, min: "owner" },
];

export function Sidebar({ admin, storefrontUrl }: { admin: Admin; storefrontUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => rank[admin.role] >= rank[n.min]);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/" className="px-3 font-display text-3xl text-cream" onClick={() => setOpen(false)}>
        Vanam<span className="text-brass">.</span>
        <span className="eyebrow ml-2 align-middle text-sage">Admin</span>
      </Link>
      <nav className="mt-10 flex-1 space-y-1" aria-label="Admin">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active(href) ? "bg-cream text-forest-950" : "text-cream/70 hover:bg-cream/10 hover:text-cream",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
        <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/50 hover:text-cream">
          <ExternalLink className="size-4" /> View storefront
        </a>
      </nav>
      <div className="rounded-2xl bg-cream/[0.06] p-4">
        <p className="truncate text-sm font-semibold text-cream">{admin.name}</p>
        <p className="truncate text-xs text-cream/50">{admin.email}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-lime px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-forest-950">{admin.role}</span>
          <div className="flex items-center gap-1">
            <Link href="/settings/password" className="rounded-lg px-2 py-1 text-xs text-cream/60 hover:bg-cream/10 hover:text-cream">
              Password
            </Link>
            <form action="/auth/signout" method="post">
              <button className="grid size-8 place-items-center rounded-lg text-cream/60 hover:bg-cream/10 hover:text-cream" aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 bg-forest-950 p-5 lg:block">{content}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-forest-950 px-4 py-3 lg:hidden">
        <span className="font-display text-2xl text-cream">
          Vanam<span className="text-brass">.</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-xl text-cream">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-forest-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-forest-950 p-5">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-cream">
              <X className="size-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

