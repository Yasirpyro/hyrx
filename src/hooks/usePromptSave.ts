import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getOrCreateFingerprint,
  getSavedPromptSet,
  persistSavedPromptSet,
} from "@/features/agents/fingerprint";

export function usePromptSave(promptId: string, initialCount = 0) {
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(new Set());
  const [saveCount, setSaveCount] = useState(initialCount);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSavedPromptIds(getSavedPromptSet());
  }, []);

  useEffect(() => {
    setSaveCount(initialCount);
  }, [initialCount]);

  const isSaved = useMemo(() => savedPromptIds.has(promptId), [savedPromptIds, promptId]);

  const toggleSave = async () => {
    if (isSaving) return;

    const fingerprint = getOrCreateFingerprint();
    const nextIds = new Set(savedPromptIds);
    const wasSaved = nextIds.has(promptId);

    setIsSaving(true);

    try {
      if (wasSaved) {
        nextIds.delete(promptId);
        setSavedPromptIds(nextIds);
        setSaveCount((count) => Math.max(0, count - 1));
        persistSavedPromptSet(nextIds);

        const { error } = await supabase
          .from("saves")
          .delete()
          .eq("prompt_id", promptId)
          .eq("fingerprint", fingerprint);

        if (error) throw error;
      } else {
        nextIds.add(promptId);
        setSavedPromptIds(nextIds);
        setSaveCount((count) => count + 1);
        persistSavedPromptSet(nextIds);

        const { error } = await supabase.from("saves").insert({
          prompt_id: promptId,
          fingerprint,
        });

        if (error) throw error;
      }
    } catch (error) {
      const rollbackIds = getSavedPromptSet();
      setSavedPromptIds(rollbackIds);
      setSaveCount(initialCount);
      console.error("toggleSave failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaved,
    saveCount,
    isSaving,
    toggleSave,
  };
}
