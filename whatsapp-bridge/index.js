// WhatsApp bridge server - run this in Termux (node index.js) while Jarvis
// is open. Jarvis's chat "whatsapp" field and the Bridge screen's manual
// form both POST to http://localhost:3000/send on this same phone.
//
// First run: scan the QR code printed below with WhatsApp
// (Settings > Linked Devices > Link a device). After that, credentials
// are saved in ./auth_info_baileys so you won't need to scan again unless
// you log out or delete that folder.

const express = require('express');
const qrcode = require('qrcode-terminal');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

let sock;
let ready = false;
let pairingRequested = false;

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Single-phone setup: you can't scan a QR shown on the same phone, so if
      // WA_NUMBER is set (country code + number, digits only, e.g. 267XXXXXXXX)
      // we request a pairing code instead. Enter it in WhatsApp > Settings >
      // Linked Devices > Link a device > Link with phone number instead.
      if (process.env.WA_NUMBER) {
        if (!pairingRequested) {
          pairingRequested = true;
          try {
            const code = await sock.requestPairingCode(process.env.WA_NUMBER);
            console.log('\nPairing code: ' + code + '\nEnter it in WhatsApp > Linked Devices > Link with phone number instead.\n');
          } catch (e) {
            pairingRequested = false;
            console.log('Could not get a pairing code: ' + e.message);
          }
        }
      } else {
        console.log('\nScan this with another device (or set WA_NUMBER to use a pairing code instead):\n');
        qrcode.generate(qr, { small: true });
      }
    }

    if (connection === 'open') {
      ready = true;
      console.log('\n✅ Connected to WhatsApp. Bridge is ready.');
    }

    if (connection === 'close') {
      ready = false;
      const statusCode = lastDisconnect && lastDisconnect.error instanceof Boom
        ? lastDisconnect.error.output.statusCode
        : null;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed.', shouldReconnect ? 'Reconnecting...' : 'Logged out - delete the auth_info_baileys folder to re-link.');
      if (shouldReconnect) { pairingRequested = false; startSock(); }
    }
  });
}

startSock();

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const { number, message } = req.body || {};
  if (!ready) {
    return res.json({ ok: false, error: 'WhatsApp not connected yet - scan the QR code in this Termux session first.' });
  }
  if (!number || !message) {
    return res.json({ ok: false, error: 'Missing number or message.' });
  }
  try {
    const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.listen(3000, () => console.log('WhatsApp bridge listening on http://localhost:3000'));
