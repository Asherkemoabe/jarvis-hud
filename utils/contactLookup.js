import * as Contacts from 'expo-contacts';

// Shared by sms.js and whatsapp.js - resolves a spoken name ("mom",
// "landlord") or a raw phone number into a real number, using the same
// expo-contacts lookup the Contacts screen already uses.

function looksLikePhoneNumber(s) {
  return /^[+\d][\d\s\-()]{5,}$/.test(s.trim());
}

export async function resolveNumber(to) {
  if (looksLikePhoneNumber(to)) return to.trim();
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
  const target = to.trim().toLowerCase();
  const match = data.find((c) => c.name && c.name.toLowerCase().includes(target) && c.phoneNumbers && c.phoneNumbers[0]);
  return match ? match.phoneNumbers[0].number : null;
}
