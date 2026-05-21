import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const lookupFamilyByCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z.string().min(1).max(32),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const normalized = data.code.trim().toUpperCase();
    if (normalized.length !== 6) {
      return { family: null, kids: [] as Array<{ id: string; name: string; avatar: string | null; pin_hash: string }> };
    }

    const { data: families, error: famErr } = await supabaseAdmin
      .from("families")
      .select("id, family_code, family_name")
      .ilike("family_code", normalized)
      .limit(1);

    if (famErr) {
      console.error("[lookupFamilyByCode] family error", famErr);
      throw new Error(famErr.message);
    }

    const family = families?.[0] ?? null;
    if (!family) return { family: null, kids: [] };

    const { data: kids, error: kidsErr } = await supabaseAdmin
      .from("kids")
      .select("id, name, avatar, pin_hash")
      .eq("family_id", family.id);

    if (kidsErr) {
      console.error("[lookupFamilyByCode] kids error", kidsErr);
      throw new Error(kidsErr.message);
    }

    return { family, kids: kids ?? [] };
  });
