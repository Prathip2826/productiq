"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-blueprint-grid bg-white/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span whileHover={{ rotate: -8, scale: 1.08 }} transition={{ duration: 0.2 }}>
            <Boxes className="w-5 h-5 text-blueprint-accent" strokeWidth={1.75} />
          </motion.span>
          <span className="font-display font-semibold tracking-tight text-lg">
            Product<span className="text-blueprint-accent">IQ</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink href="/" active={pathname === "/"}>
            New product
          </NavLink>
          <NavLink href="/batch" active={pathname === "/batch"}>
            Batch upload
          </NavLink>
          <NavLink href="/catalog" active={pathname === "/catalog"}>
            Catalog
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="relative py-1.5 text-blueprint-muted hover:text-blueprint-text transition-colors">
      {children}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blueprint-accent rounded-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}
