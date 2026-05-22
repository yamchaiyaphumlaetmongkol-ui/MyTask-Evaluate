interface AppLoadingProps {
  /** เต็มพื้นที่ content / หน้าจอ (ใช้ตอนยังไม่มี shell) */
  fullPage?: boolean;
}

export function AppLoading({ fullPage = false }: AppLoadingProps) {
  return (
    <div
      className={`erp-loading ${fullPage ? "erp-loading--full-page" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลด"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/loading.gif" alt="" className="erp-loading-gif" />
      <span className="visually-hidden">กำลังโหลด</span>
    </div>
  );
}
