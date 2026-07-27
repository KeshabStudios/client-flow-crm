import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { UserSettings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If no settings exist yet, create defaults
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      setError(msg);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (
      userId: string,
      updates: Partial<Omit<UserSettings, "id" | "user_id" | "created_at">>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: updateError } = await supabase
          .from("user_settings")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;
        setSettings(data);
        return data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update settings";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { settings, loading, error, fetchSettings, updateSettings };
}
