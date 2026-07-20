import { supabase } from './supabase';

/**
 * Vincula a dos usuarios utilizando una función RPC segura en Supabase.
 * @param {string} userId - ID del usuario actual.
 * @param {string} partnerCode - Código de vinculación ingresado (6 caracteres).
 * @returns {Promise<{success: boolean, error?: string, couple_id?: string}>}
 */
export async function linkPartner(userId, partnerCode) {
  // Validación básica del código antes de llamar al RPC
  if (!partnerCode || typeof partnerCode !== 'string' || partnerCode.trim().length !== 6) {
    return { success: false, error: 'El código debe tener 6 caracteres.' };
  }

  try {
    const { data, error } = await supabase.rpc('link_partners', {
      current_user_id: userId,
      partner_code_input: partnerCode.trim(),
    });

    if (error) {
      console.error('Error en RPC link_partners:', error);
      return { success: false, error: error.message };
    }

    // La función devuelve { success: true/false, error: '...' } o { success: true, couple_id: ... }
    return data;
  } catch (err) {
    console.error('Excepción al llamar a link_partners:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Convierte al usuario actual en una "pareja solitaria", estableciendo couple_id = su propio id.
 * @param {string} userId - ID del usuario actual.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function skipPairing(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ couple_id: userId })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Crear estado de mascota para el usuario en solitario
  const { error: petError } = await supabase.from('pet_state').upsert({
    couple_id: userId,
    hunger: 50,
    happiness: 50,
    pet_action: 'idle',
  });

  if (petError) {
    console.warn('No se pudo crear el estado de la mascota (solo):', petError);
  }

  return { success: true };
}