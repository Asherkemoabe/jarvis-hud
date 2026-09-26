import { PermissionsAndroid, Platform } from 'react-native';
import * as SmsSender from 'expo-android-sms-sender';
import * as Contacts from 'expo-contacts';

// Sends a real SMS silently in the background - no Messages app popup,
// no user tap needed. "to" can be a phone number OR a contact name
// ("mom", "landlord") - we resolve names using the same expo-contacts
// lookup the Contacts screen already uses.

function looksLikePhoneNumber(s) {
  return /^[+\d][\d\s\-()]{5,}$/.test(s.trim());
}

async function resolveNumber(to) {
  if (looksLikePhoneNumber(to)) return to.trim();
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
  const target = to.trim().toLowerCase();
  const match = data.find((c) => c.name && c.name.toLowerCase().includes(target) && c.phoneNumbers && c.phoneNumbers[0]);
  return match ? match.phoneNumbers[0].number : null;
}

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
