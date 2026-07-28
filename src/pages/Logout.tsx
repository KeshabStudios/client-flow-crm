import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SeoHead } from "@/components/shared/SeoHead";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <>
      <SeoHead title="Signing Out" />
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
          <span className="sr-only">Signing out...</span>
        </div>
      </div>
    </>
  );
}
