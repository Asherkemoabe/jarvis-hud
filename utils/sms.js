import { PermissionsAndroid, Platform } from 'react-native';
import * as SmsSender from 'expo-android-sms-sender';
import { resolveNumber } from './contactLookup';

// Sends a real SMS silently in the background - no Messages app popup,
// no user tap needed. "to" can be a phone number OR a contact name.

export async function sendSmsTo(to, body) {
  if (Platform.OS !== 'android') {
    return { ok: false, reason: 'Sending SMS directly is Android-only right now.' };
  }
  if (!to || !body) {
    return { ok: false, reason: 'Missing a recipient or message text for the SMS.' };
  }
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    return { ok: false, reason: 'SMS permission was denied, sir.' };
  }
  const number = await resolveNumber(to);
  if (!number) {
    return { ok: false, reason: `Couldn't find a number for "${to}", sir.` };
  }
  try {
    await SmsSender.sendSms(number, body);
    return { ok: true, to: number };
  } catch (e) {
    return { ok: false, reason: `Couldn't send the text: ${e.message}` };
  }
}
