import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenWrap, PrimaryButton, Empty, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, DANGER, LINE } from '../theme';

// Real device-level encrypted storage (Android Keystore under the hood) —
// simple name/secret pairs, not a full password-manager UI (no autofill
// integration; that needs native code outside Expo managed workflow).
const INDEX_KEY = 'jarvis_vault_index';

export default function VaultScreen({ accent, onBack }) {
  const [index, setIndex] = useState([]);
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    SecureStore.getItemAsync(INDEX_KEY).then((v) => v && setIndex(JSON.parse(v)));
  }, []);

  const save = async () => {
    if (!name.trim() || !secret.trim()) return;
    await SecureStore.setItemAsync('vault_' + name.trim(), secret.trim());
    const next = [...index.filter((n) => n !== name.trim()), name.trim()];
    setIndex(next);
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(next));
    setName('');
    setSecret('');
  };

  const reveal = async (n) => {
    const v = await SecureStore.getItemAsync('vault_' + n);
    setRevealed((r) => ({ ...r, [n]: v }));
  };

  const remove = async (n) => {
    await SecureStore.deleteItemAsync('vault_' + n);
    const next = index.filter((i) => i !== n);
    setIndex(next);
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(next));
  };

  return (
    <ScreenWrap title="Vault" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <Text style={styles.note}>Stored via the device's secure keystore, not in this app's code or any file.</Text>
        <TextInput style={sharedInput} value={name} onChangeText={setName} placeholder="Label (e.g. Fiverr login)" placeholderTextColor={TEXT_DIM} />
        <TextInput style={[sharedInput, { marginTop: 8 }]} value={secret} onChangeText={setSecret} placeholder="Secret / password" placeholderTextColor={TEXT_DIM} secureTextEntry autoCapitalize="none" />
        <PrimaryButton label="Save to vault" accent={accent} onPress={save} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={index}
        keyExtractor={(n) => n}
        ListEmptyComponent={<Empty text="Vault is empty." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{item}</Text>
              {revealed[item] ? <Text style={styles.secret}>{revealed[item]}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => reveal(item)}><Text style={{ color: accent, marginRight: 14 }}>Reveal</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)}><Text style={{ color: DANGER }}>Delete</Text></TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  note: { color: TEXT_DIM, fontSize: 11, marginBottom: 10, lineHeight: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT, fontWeight: '600' },
  secret: { color: TEXT_DIM, marginTop: 4, fontFamily: 'monospace' },
});
