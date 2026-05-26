"use client";

import { useState } from "react";

type Props = {
  url: string;
  label?: string;
};

export function ShareLinkButton({ url, label = "คัดลอกลิงก์" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const full =
        typeof window !== "undefined"
          ? `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`
          : url;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={handleCopy}
      title={url}
    >
      <i className="bi bi-link-45deg me-1" aria-hidden />
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}
