import { supabase } from "../lib/supabaseClient";

export const emptyPerfil = {
  semanaActual: 24,
  fpp: "",
  medico: "",
  hospital: "",
  cantidadBebes: 1,
  sexo: "",
  onboardingCompleted: false,
};

function mapRow(row) {
  if (!row) return { ...emptyPerfil };
  return {
    semanaActual: row.semana_actual ?? emptyPerfil.semanaActual,
    fpp: row.fpp ?? "",
    medico: row.medico ?? "",
    hospital: row.hospital ?? "",
    cantidadBebes: row.cantidad_bebes ?? emptyPerfil.cantidadBebes,
    sexo: row.sexo ?? "",
    onboardingCompleted: row.onboarding_completed ?? false,
  };
}

export async function loadPerfil() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ...emptyPerfil };

  const { data, error } = await supabase
    .from("profiles")
    .select("semana_actual, fpp, medico, hospital, cantidad_bebes, sexo, onboarding_completed")
    .eq("id", userData.user.id)
    .single();

  if (error) return { ...emptyPerfil };
  return mapRow(data);
}

export async function savePerfil(perfil) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase.from("profiles").upsert({
    id: userData.user.id,
    semana_actual: perfil.semanaActual,
    fpp: perfil.fpp || null,
    medico: perfil.medico,
    hospital: perfil.hospital,
    cantidad_bebes: perfil.cantidadBebes,
    sexo: perfil.sexo || null,
    onboarding_completed: perfil.onboardingCompleted ?? true,
  });
}
