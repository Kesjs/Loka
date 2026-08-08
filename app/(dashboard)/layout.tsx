import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return <DashboardShell>{children}</DashboardShell>;
}
