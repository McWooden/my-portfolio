import { supabase } from './supabase';

/**
 * Fetch homepage settings from Supabase and build the partitions array.
 * Shared between (website)/layout.jsx and (website)/page.jsx to avoid
 * duplicating both the query and the fallback logic.
 *
 * @returns {{ partitions: string[], settings: object }}
 */
export async function getHomepageSettings() {
  const { data: settingsData, error: settingsError } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'homepage')
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching homepage settings:', {
      message: settingsError.message,
      code: settingsError.code,
      details: settingsError.details,
      hint: settingsError.hint,
    });
  }

  const homepageSettings = settingsData?.value || {};
  let partitions = homepageSettings.partitions;

  if (!partitions || !Array.isArray(partitions)) {
    partitions = [];
    const openCount = Number(homepageSettings.openSlots) ?? 2;
    const isWorking = homepageSettings.status === 'working' || homepageSettings.status === 'busy';
    for (let i = 0; i < 4; i++) {
      if (i < openCount) partitions.push('open');
      else if (isWorking) partitions.push('working');
      else partitions.push('campus');
    }
  }

  return { partitions, settings: homepageSettings };
}
