import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

export async function isCurrentUserAdmin() {
  if (!hasSupabaseConfig) return false

  const supabase = await getSupabaseClient()
  const { data, error } = await supabase.rpc("is_admin")

  if (error) {
    throw new Error(error.message)
  }

  return data === true
}

