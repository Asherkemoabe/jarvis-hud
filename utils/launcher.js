import { Platform } from 'react-native';
import LauncherKit from 'react-native-launcher-kit';

// Opens ANY installed app by spoken name - no premade list, no tab.
// Works for apps installed after the fact too, since we query the device
// live every time instead of keeping a hardcoded array.
// Requires QUERY_ALL_PACKAGES (see app.json) - fine for a personal/sideloaded
// build, would need Play Store justification only if this ever gets published.

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function launchAppByName(spokenName) {
  if (Platform.OS !== 'android') {
    return { ok: false, reason: 'App launching by name is Android-only right now.' };
  }
  if (!spokenName || !spokenName.trim()) {
    return { ok: false, reason: 'No app name given.' };
  }
  try {
    const apps = await LauncherKit.getApps();
    const target = normalize(spokenName);
    // exact match first, then "contains", so "whatsapp" matches
    // "WhatsApp Messenger" too
    let match = apps.find((a) => normalize(a.appName || a.label) === target);
    if (!match) {
      match = apps.find((a) => normalize(a.appName || a.label).includes(target));
    }
    if (!match) {
      return { ok: false, reason: `Couldn't find an app matching "${spokenName}" on this phone.` };
    }
    await LauncherKit.launchApplication(match.packageName);
    return { ok: true, appName: match.appName || match.label };
  } catch (e) {
    return { ok: false, reason: `Couldn't open that app: ${e.message}` };
  }
}
