import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormSkeleton } from "@/components/shared/PageSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Camera,
  Save,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, error, fetchProfile, updateProfile, uploadAvatar } =
    useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { first_name: firstName, last_name: lastName, phone });
      toast({ title: "Success", description: "Profile updated." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "File too large. Max 2MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(user.id, file);
      toast({ title: "Success", description: "Avatar updated." });
      await fetchProfile(user.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = () => {
    if (firstName || lastName) {
      return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "?";
  };

  // Loading state
  if (loading && !profile) {
    return (
      <>
        <SeoHead title="Profile" />
        <FormSkeleton fields={3} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <SeoHead title="Profile" description="Manage your personal information and avatar." />

      <PageHeader
        title="Profile"
        description="Manage your personal information and avatar."
      />

      {error && <ErrorState message={error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Upload your profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-28 w-28">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              aria-label="Upload avatar image"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile photo"
            >
              <Camera className="mr-2 h-4 w-4" />
              {avatarUploading ? "Uploading..." : "Change Photo"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              PNG or JPG. Max 2MB.
            </p>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name, email, and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  value={user?.email || ""}
                  readOnly
                  className="pl-9 bg-muted/50 cursor-not-allowed"
                  tabIndex={-1}
                  aria-label="Email address (read-only)"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email cannot be changed. Contact support to update your email.
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="pl-9"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    aria-label="First name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className="pl-9"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    aria-label="Last name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-label="Phone number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (profile) {
                    setFirstName(profile.first_name || "");
                    setLastName(profile.last_name || "");
                    setPhone(profile.phone || "");
                  }
                }}
                disabled={saving}
              >
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
