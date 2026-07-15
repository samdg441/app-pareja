import { supabase } from './supabase';

/**
 * Links the current user with a partner using a pairing code.
 * @param {string} userId - The current user's ID.
 * @param {string} partnerCode - The 6-character pairing code of the partner.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function linkPartner(userId, partnerCode) {
  if (!partnerCode || typeof partnerCode !== 'string' || partnerCode.trim().length !== 6) {
    return { success: false, error: 'El código debe tener 6 caracteres.' };
  }

  // 1. Find partner by code
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('pairing_code', partnerCode.trim().toUpperCase())
    .single();

  if (partnerError || !partnerProfile) {
    return { success: false, error: 'No se encontró una cuenta con ese código.' };
  }

  // 2. Check if partner is already paired
  if (partnerProfile.partner_id) {
    return { success: false, error: 'Este usuario ya está vinculado con otra persona.' };
  }

  // 3. Create a shared couple_id
  const coupleId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

  // 4. Update both profiles
  const { error: updateError1 } = await supabase
    .from('profiles')
    .update({ partner_id: partnerProfile.id, couple_id: coupleId })
    .eq('id', userId);

  const { error: updateError2 } = await supabase
    .from('profiles')
    .update({ partner_id: userId, couple_id: coupleId })
    .eq('id', partnerProfile.id);

  if (updateError1 || updateError2) {
    return { success: false, error: 'Error al vincular los perfiles. Intenta de nuevo.' };
  }

  // 5. Create shared pet state (if it doesn't exist already)
  const { error: petError } = await supabase.from('pet_state').upsert({
    couple_id: coupleId,
    hunger: 50,
    happiness: 50,
    pet_action: 'idle',
  });

  if (petError) {
    console.warn('No se pudo crear el estado de la mascota:', petError);
    // Not critical – we still return success
  }

  return { success: true };
}

/**
 * Makes the current user a "solo" couple, setting couple_id = own id.
 * @param {string} userId - The current user's ID.
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

  // Optionally create a solo pet state
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