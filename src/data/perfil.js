import { supabase } from "../lib/supabaseClient";

export const emptyPerfil = {
  semanaActual: 24,
  fpp: "",
  medico: "",
  hospital: "",
};

function mapRow(row) {
  if (!row) return { ...emptyPerfil };
  return {
    semanaActual: row.semana_actual ?? emptyPerfil.semanaActual,
    fpp: row.fpp ?? "",
    medico: row.medico ?? "",
    hospital: row.hospital ?? "",
  };
}

export async function loadPerfil() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ...emptyPerfil };

  const { data, error } = await supabase
    .from("profiles")
    .select("semana_actual, fpp, medico, hospital")
    .eq("id", userData.user.id)
    .single();

  if (error) return { ...emptyPerfil };
  return mapRow(data);
}

export async function savePerfil(perfil) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase
    .from("profiles")
    .update({
      semana_actual: perfil.semanaActual,
      fpp: perfil.fpp || null,
      medico: perfil.medico,
      hospital: perfil.hospital,
    })
    .eq("id", userData.user.id);
}
