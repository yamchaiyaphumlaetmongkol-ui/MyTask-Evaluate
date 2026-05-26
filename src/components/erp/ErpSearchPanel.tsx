"use client";

import { ErpSearchPendingProvider } from "@/components/erp/ErpSearchPendingContext";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import {
  useTransition,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";

type Props = {
  action?: string;
  method?: FormHTMLAttributes<HTMLFormElement>["method"];
  role?: string;
  className?: string;
  panelClassName?: string;
  children: ReactNode;
  /** เมื่อกำหนด — ไม่เปลี่ยน URL (ใช้กับ sessionStorage filter) */
  onSearch?: (params: Record<string, string>) => void;
};

function formToParams(form: HTMLFormElement): Record<string, string> {
  const params: Record<string, string> = {};
  const fd = new FormData(form);
  fd.forEach((value, key) => {
    const text = String(value).trim();
    if (text) params[key] = text;
  });
  return params;
}

function buildGetHref(action: string, form: HTMLFormElement): string {
  const params = new URLSearchParams(formToParams(form));
  const qs = params.toString();
  return qs ? `${action}?${qs}` : action;
}

/** ฟอร์มค้นหา — นำทาง client-side เพื่อให้โหลดเฉพาะส่วนที่อยู่ใน Suspense */
export function ErpSearchPanel({
  action = "",
  method = "get",
  role = "search",
  className,
  panelClassName,
  children,
  onSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (method !== "get") return;
    e.preventDefault();
    if (onSearch) {
      const params = formToParams(e.currentTarget);
      startTransition(() => onSearch(params));
      return;
    }
    const target = action.startsWith("/")
      ? action
      : `${pathname}${action}`;
    const href = buildGetHref(target, e.currentTarget);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <ErpSearchPendingProvider pending={isPending}>
      <form
        method={method}
        action={action}
        role={role}
        className={cn("erp-search-form mb-4", className)}
        onSubmit={onSubmit}
      >
        <div
          className={cn(
            "card erp-panel erp-search-panel border-0",
            panelClassName,
            isPending && "erp-search-panel--pending",
          )}
        >
          <div className="card-body erp-search-panel__body">{children}</div>
        </div>
      </form>
    </ErpSearchPendingProvider>
  );
}
