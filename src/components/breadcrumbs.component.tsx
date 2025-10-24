"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">All events</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, idx) => [
          <BreadcrumbSeparator key={`sep-${idx}`} />,
          <BreadcrumbItem key={`item-${idx}`}>
            {item.href ? (
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink>{item.label}</BreadcrumbLink>
            )}
          </BreadcrumbItem>,
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
