import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">ClientFlow</span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          CRM
        </span>
      </div>
      <div className="text-center">
        <h1 className="text-7xl font-bold tracking-tighter text-primary mb-4">
          404
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
