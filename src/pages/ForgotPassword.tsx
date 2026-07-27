import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { SeoHead } from "@/components/shared/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { error, forgotPassword, clearError } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
      toast.success("Password reset email sent!", {
        description: "Check your inbox for the reset link.",
      });
    } catch {
      // Error is handled by AuthContext
    }
  };

  if (isSuccess) {
    return (
      <>
        <SeoHead title="Check Your Email" description="Password reset link sent." />
        <AuthLayout title="Check your email" subtitle="We've sent you a password reset link.">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            If an account exists with that email address, we've sent a password
            reset link. Please check your inbox and follow the instructions.
          </p>
          <Button variant="outline" className="mt-2" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Forgot Password" description="Reset your ClientFlow CRM password." />
      <AuthLayout
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            autoFocus
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Sending...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Send reset link
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="inline-flex items-center font-medium text-primary hover:text-primary/80">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
    </>
  );
}
