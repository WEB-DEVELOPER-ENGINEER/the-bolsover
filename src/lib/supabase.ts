import { createClient } from "@supabase/supabase-js";

const getSupabaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && envUrl.trim().startsWith("http")) {
    return envUrl.trim();
  }
  return "https://jaiybxlzrdnofevtlwrg.supabase.co";
};

const getSupabaseKey = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey.trim()) return serviceKey.trim();
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (pubKey && pubKey.trim()) return pubKey.trim();
  return "sb_publishable_XCGrfm85iwP_Exl9SUcP5A_RLF9BhqP";
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseKey(), {
  auth: {
    persistSession: false
  }
});

