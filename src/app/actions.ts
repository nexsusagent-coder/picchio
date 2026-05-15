'use server'

import { revalidatePath } from 'next/cache';

/**
 * Manually or automatically revalidates the menu-related paths to clear Next.js cache.
 * Ensures the live site is always in sync with admin updates.
 */
export async function publishChanges() {
  try {
    revalidatePath('/menu');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error("Revalidation Error:", err);
    return { success: false, error: String(err) };
  }
}
