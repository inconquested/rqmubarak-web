"use client";

import { PageSwitch } from "@/components/portal/motion";

export default function PortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageSwitch>{children}</PageSwitch>;
}
