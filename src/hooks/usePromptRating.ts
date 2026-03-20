import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateFingerprint } from "@/features/agents/fingerprint";
import { toast } from "sonner";

export function usePromptRating(promptId: string, initialAverage = 0, initialCount = 0) {
  const [ratingAvg, setRatingAvg] = useState(initialAverage);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRating = async (score: number) => {
    if (isSubmitting || score < 1 || score > 5) return;
    if (!promptId) {
      toast.error("Prompt is still loading");
      return;
    }

    setIsSubmitting(true);

    try {
      const fingerprint = getOrCreateFingerprint();

      const { error: upsertError } = await supabase.from("ratings").upsert(
        {
          prompt_id: promptId,
          fingerprint,
          score,
        },
        {
          onConflict: "prompt_id,fingerprint",
          ignoreDuplicates: false,
        },
      );

      if (upsertError) throw upsertError;

      const { error: rpcError } = await supabase.rpc("update_prompt_rating_avg", {
        p_prompt_id: promptId,
      });

      if (rpcError) throw rpcError;

      const { data, error: promptError } = await supabase
        .from("prompts")
        .select("rating_avg, rating_count")
        .eq("id", promptId)
        .single();

      if (promptError) throw promptError;

      setRatingAvg(data.rating_avg ?? 0);
      setRatingCount(data.rating_count ?? 0);
      toast.success("Rating submitted");
    } catch (error) {
      console.error("submitRating failed", error);
      const message =
        error instanceof Error ? error.message : "Could not submit rating";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ratingAvg,
    ratingCount,
    isSubmitting,
    submitRating,
  };
}
