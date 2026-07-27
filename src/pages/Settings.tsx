import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { ErrorState } from "@/components/shared/ErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Sun,
  Moon,
  Globe,
  Bell,
  BellRing,
  Shield,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

import { LANGUAGES } from "@/lib/translations";

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { settings, loading, error, fetchSettings, updateSettings } = useSettings();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (user) fetchSettings(user.id);
  }, [user, fetchSettings]);

  useEffect(() => {
    if (settings) {
      if (settings.language) setLanguage(settings.language as any);
      setEmailNotifs(settings.email_notifications ?? true);
      setPushNotifs(settings.push_notifications ?? true);
      if (settings.theme === "dark" || settings.theme === "light") {
        setTheme(settings.theme);
      }
    }
  }, [settings, setTheme, setLanguage]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      await updateSettings(user.id, { theme, language, email_notifications: emailNotifs, push_notifications: pushNotifs });
      toast({ title: "Success", description: "Preferences saved." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save preferences";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (!currentPassword) { setPwError("Current password is required."); return; }
    if (newPassword.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }

    setChangingPw(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      if (signInError) {
        setPwError(signInError.message.includes("Invalid login credentials") ? "Current password is incorrect." : signInError.message);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) { setPwError(updateError.message); return; }
      toast({ title: "Success", description: "Password updated." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading && !settings) {
    return <><SeoHead title="Settings" /><SettingsSkeleton /></>;
  }

  return (
    <div className="space-y-6">
      <SeoHead title={t("page.settings.title")} description={t("page.settings.desc")} />

      <PageHeader title={t("page.settings.title")} description={t("page.settings.desc")} />

      {error && <ErrorState message={error} />}

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              )}
              <div>
                <CardTitle>{t("settings.appearance")}</CardTitle>
                <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-sm font-medium">{t("settings.darkMode")}</Label>
                <p className="text-xs text-muted-foreground">
                  {theme === "dark" ? "Dark theme is active" : "Light theme is active"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Sun className={`h-4 w-4 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle dark mode"
                />
                <Moon className={`h-4 w-4 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>{t("settings.language")}</CardTitle>
                <CardDescription>{t("settings.languageDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full sm:w-[250px]" aria-label={t("settings.language")}>
                <SelectValue placeholder={t("settings.language")} />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.nativeLabel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>{t("settings.notifications")}</CardTitle>
                <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <Label htmlFor="email-notifs" className="text-sm font-medium">{t("settings.emailNotifs")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.emailNotifsDesc")}</p>
                </div>
              </div>
              <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} aria-label="Toggle email notifications" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <BellRing className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <Label htmlFor="push-notifs" className="text-sm font-medium">{t("settings.pushNotifs")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.pushNotifsDesc")}</p>
                </div>
              </div>
              <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} aria-label="Toggle push notifications" />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveSettings} disabled={savingSettings || loading}>
                {savingSettings ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" />{t("settings.savePrefs")}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>{t("settings.changePassword")}</CardTitle>
                <CardDescription>{t("settings.changePasswordDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pwError && (
              <Alert variant="destructive" className="py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{pwError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-9"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showNewPw ? "Hide password" : "Show password"}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleChangePassword} disabled={changingPw}>
                {changingPw ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                ) : (
                  <><Shield className="mr-2 h-4 w-4" />Change Password</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
