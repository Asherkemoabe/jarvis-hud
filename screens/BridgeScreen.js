import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking, StyleSheet, Alert } from 'react-native';
import { ScreenWrap, Card, PrimaryButton, Label, sharedInput } from '../components/UI';
import { TEXT_DIM } from '../theme';

// WhatsApp: real send/receive needs the Termux + Baileys bridge running on
// this same phone (see the other setup we did) — this screen just talks to
// that local server. SMS: uses the native compose intent (prefilled, you
// tap send) since silent auto-send requires being the default SMS app.
export default function BridgeScreen({ accent, onBack }) {
  const [waNumber, setWaNumber] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMsg, setSmsMsg] = useState('');

  const sendWhatsApp = async () => {
    try {
      const res = await fetch('http://localhost:3000/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: waNumber.replace(/\D/g, ''), message: waMsg }),
      });
      const data = await res.json();
      Alert.alert(data.ok ? 'Sent' : 'Failed', data.ok ? 'Message sent via the Termux bridge.' : data.error);
    } catch (e) {
      Alert.alert('Bridge not reachable', 'Make sure the Termux + Baileys server is running (node index.js) on this phone.');
    }
  };

  const composeSms = () => {
    const sep = Platform_OS_IOS ? '&' : '?';
    Linking.openURL(`sms:${smsNumber}${sep}body=${encodeURIComponent(smsMsg)}`);
  };
  const Platform_OS_IOS = false; // Android target; flip if you build for iOS too

  return (
    <ScreenWrap title="WhatsApp / SMS" accent={accent} onBack={onBack}>
      <Card>
        <Label>WHATSAPP (via Termux bridge)</Label>
        <TextInput style={sharedInput} value={waNumber} onChangeText={setWaNumber} placeholder="Number incl. country code" placeholderTextColor={TEXT_DIM} keyboardType="phone-pad" />
        <TextInput style={[sharedInput, { marginTop: 8 }]} value={waMsg} onChangeText={setWaMsg} placeholder="Message" placeholderTextColor={TEXT_DIM} />
        <PrimaryButton label="Send via WhatsApp" accent={accent} onPress={sendWhatsApp} />
        <Text style={styles.note}>Requires the Termux Baileys server running on this phone first.</Text>
      </Card>

      <Card>
        <Label>SMS</Label>
        <TextInput style={sharedInput} value={smsNumber} onChangeText={setSmsNumber} placeholder="Phone number" placeholderTextColor={TEXT_DIM} keyboardType="phone-pad" />
        <TextInput style={[sharedInput, { marginTop: 8 }]} value={smsMsg} onChangeText={setSmsMsg} placeholder="Message" placeholderTextColor={TEXT_DIM} />
        <PrimaryButton label="Open in Messages" accent={accent} onPress={composeSms} />
        <Text style={styles.note}>Pre-fills your SMS app — you tap send. Silent auto-send needs Jarvis to be your default SMS app, a bigger separate step.</Text>
      </Card>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  note: { color: TEXT_DIM, fontSize: 11, marginTop: 8, lineHeight: 16 },
});
