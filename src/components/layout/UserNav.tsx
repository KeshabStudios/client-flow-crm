import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  User,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

export function UserNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAvatar = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.avatar_url) setProfileAvatar(data.avatar_url);
    };
    fetchAvatar();
  }, [user]);

  // Refresh avatar when window regains focus (e.g. after profile edit)
  useEffect(() => {
    if (!user) return;
    const onFocus = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.avatar_url) setProfileAvatar(data.avatar_url);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  const avatarSrc = profileAvatar || user?.user_metadata?.avatar_url || "";

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 gap-2 rounded-full px-2 data-[state=open]:bg-accent"
          aria-label={t("nav.userMenu")}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={avatarSrc}
              alt={userName}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex md:flex-col md:items-start md:leading-tight">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-[11px] text-muted-foreground">
              {userEmail}
            </span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => navigate("/logout")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
