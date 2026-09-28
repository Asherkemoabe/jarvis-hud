import { resolveNumber } from './contactLookup';

// The bridge needs the full international number. Contacts saved in local
// Botswana format (8 digits, e.g. "77 123 456") get the 267 prefix added.
function normalizeForWhatsApp(raw) {
  const hasPlus = raw.trim().startsWith('+');
  const digits = raw.replace(/\D/g, '');
  if (hasPlus) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('267') && digits.length >= 11) return digits;
  if (digits.length <= 8) return '267' + digits.replace(/^0+/, '');
  return digits;
}

// Sends a real WhatsApp message directly from chat, no separate screen -
// but unlike SMS, there's no native Android API for this. It goes through
// the Termux + Baileys bridge server (node index.js) that must already be
// running on this same phone, listening on localhost:3000 - the same
// server the Bridge screen's "Send via WhatsApp" button talks to.

export async function sendWhatsAppTo(to, body) {
  if (!to || !body) {
    return { ok: false, reason: 'Missing a recipient or message text for WhatsApp.' };
  }
  const number = await resolveNumber(to);
  if (!number) {
    return { ok: false, reason: `Couldn't find a number for "${to}", sir.` };
  }
  try {
    const res = await fetch('http://127.0.0.1:3000/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: normalizeForWhatsApp(number), message: body }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, reason: data.error || 'The WhatsApp bridge reported a failure.' };
    }
    return { ok: true, to: number };
  } catch (e) {
    return { ok: false, reason: `Couldn't reach the WhatsApp bridge (${e.message}). Make sure it is running in Termux (node index.js).` };
  }
}
