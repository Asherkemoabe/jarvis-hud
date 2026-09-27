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

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\nScan this with WhatsApp > Settings > Linked Devices > Link a device:\n');
      qrcode.generate(qr, { small: true });
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
      if (shouldReconnect) startSock();
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
