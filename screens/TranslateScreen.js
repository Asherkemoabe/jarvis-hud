import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { ScreenWrap, PrimaryButton, Label, sharedInput } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

// Routed through the Groq key you already have — no separate translation
// API/cost needed.
export default function TranslateScreen({ accent, apiKey, onBack, onNeedKey }) {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('Setswana');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  const translate = async () => {
    if (!apiKey) { Alert.alert('No API key', 'Add your Groq key in Settings first.'); onNeedKey && onNeedKey(); return; }
    if (!text.trim()) return;
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Translate what the user gives you. Reply with only the translation, nothing else.' },
            { role: 'user', content: `Translate to ${lang}: ${text}` },
          ],
        }),
      });
      const data = await res.json();
      setResult(data?.choices?.[0]?.message?.content?.trim() || 'No translation returned.');
    } catch (e) {
      setResult('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrap title="Translate" accent={accent} onBack={onBack}>
      <Label>TEXT</Label>
      <TextInput style={[sharedInput, { minHeight: 70 }]} multiline value={text} onChangeText={setText} placeholder="Type something..." placeholderTextColor={TEXT_DIM} />
      <Label>TARGET LANGUAGE</Label>
      <TextInput style={sharedInput} value={lang} onChangeText={setLang} placeholder="e.g. Setswana, French" placeholderTextColor={TEXT_DIM} />
      <PrimaryButton label={busy ? 'Translating...' : 'Translate'} accent={accent} onPress={translate} disabled={busy} />
      {result ? (
        <View style={styles.result}>
          <Text style={{ color: TEXT }}>{result}</Text>
        </View>
      ) : null}
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  result: { marginTop: 16, padding: 14, backgroundColor: '#0d151b', borderRadius: 12 },
});
