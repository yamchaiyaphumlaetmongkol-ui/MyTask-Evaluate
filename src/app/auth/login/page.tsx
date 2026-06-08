import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";
import { APP_CONFIG } from "@/lib/app-config";

export default function LoginPage() {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center px-3 py-5 bg-white">
      <div className="erp-top-accent position-fixed top-0 start-0 end-0" />
      <div className="text-center mb-4">
        <Image
          src="/logo2.gif"
          alt={APP_CONFIG.title}
          width={64}
          height={64}
          className="erp-logo mb-2"
          priority
        />
        <div className="erp-brand-title">{APP_CONFIG.brandTitle}</div>
        <div className="text-muted small">{APP_CONFIG.tagline}</div>
      </div>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <LoginForm />
      </div>
    </div>
  );
}
