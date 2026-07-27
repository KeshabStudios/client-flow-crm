import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (userId: string, updates: Partial<Profile>) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: updates.first_name,
            last_name: updates.last_name,
            phone: updates.phone,
            avatar_url: updates.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (updateError) throw updateError;
        setProfile(data);
        return data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update profile";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadAvatar = useCallback(
    async (userId: string, file: File): Promise<string> => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      await updateProfile(userId, { avatar_url: publicUrl });
      return publicUrl;
    },
    [updateProfile]
  );

  return { profile, loading, error, fetchProfile, updateProfile, uploadAvatar };
}
