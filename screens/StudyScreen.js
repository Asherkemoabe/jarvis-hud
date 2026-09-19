import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { ScreenWrap, PrimaryButton, Label, sharedInput } from '../components/UI';
import { TEXT, TEXT_DIM, PANEL2 } from '../theme';

export default function StudyScreen({ accent, apiKey, onBack, onNeedKey }) {
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    if (!apiKey) { Alert.alert('No API key', 'Add your Groq key in Settings first.'); onNeedKey && onNeedKey(); return; }
    if (!topic.trim()) return;
    setBusy(true);
    setAnswer('');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a patient study tutor. Explain clearly with a short example. Keep it focused.' },
            { role: 'user', content: topic },
          ],
        }),
      });
      const data = await res.json();
      setAnswer(data?.choices?.[0]?.message?.content?.trim() || 'No answer returned.');
    } catch (e) {
      setAnswer('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrap title="Study Assistant" accent={accent} onBack={onBack}>
      <Label>WHAT DO YOU WANT EXPLAINED?</Label>
      <TextInput style={[sharedInput, { minHeight: 70 }]} multiline value={topic} onChangeText={setTopic} placeholder="e.g. explain compound interest" placeholderTextColor={TEXT_DIM} />
      <PrimaryButton label={busy ? 'Thinking...' : 'Explain'} accent={accent} onPress={ask} disabled={busy} />
      {answer ? (
        <ScrollView style={styles.result}>
          <Text style={{ color: TEXT, lineHeight: 20 }}>{answer}</Text>
        </ScrollView>
      ) : null}
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  result: { marginTop: 16, padding: 14, backgroundColor: PANEL2, borderRadius: 12, maxHeight: 300 },
});
