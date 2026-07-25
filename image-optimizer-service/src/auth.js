import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

let adminClient;

const getAdminClient = () => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("Faltan variables de Supabase para validar administradores.");
    error.statusCode = 500;
    throw error;
  }

  if (!adminClient) {
    adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }

  return adminClient;
};

export async function requireSupabaseAdmin(request, reply) {
  if (!config.requireSupabaseAdmin) return;

  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return reply.code(401).send({
      error: "missing_token",
      message: "Inicia sesion como admin para subir imagenes."
    });
  }

  const supabase = getAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return reply.code(401).send({
      error: "invalid_token",
      message: "La sesion no es valida o expiro."
    });
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(adminError.message);
  }

  if (!adminUser) {
    return reply.code(403).send({
      error: "forbidden",
      message: "Este usuario no tiene permiso admin para subir imagenes."
    });
  }
}
