import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { ScreenWrap, PrimaryButton, Label, sharedInput } from '../components/UI';
import { TEXT, TEXT_DIM, PANEL2 } from '../theme';

function basicSyntaxCheck(code) {
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const closers = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of code) {
    if (pairs[ch]) stack.push(ch);
    else if (closers[ch]) {
      if (stack.pop() !== closers[ch]) return 'Mismatched brackets found.';
    }
  }
  if (stack.length) return 'Unclosed bracket: ' + stack[stack.length - 1];
  return null;
}

export default function CodeScreen({ accent, apiKey, onBack, onNeedKey }) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  const check = () => {
    const err = basicSyntaxCheck(code);
    setOutput(err ? 'SYNTAX ISSUE: ' + err : 'Basic bracket check passed. This is not a full parser - use "Ask Jarvis" below for real review.');
  };

  const askJarvis = async () => {
    if (!apiKey) { Alert.alert('No API key', 'Add your Groq key in Settings first.'); onNeedKey && onNeedKey(); return; }
    if (!code.trim()) return;
    setBusy(true);
    setOutput('Asking Jarvis to review...');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are JARVIS. Review the pasted code for bugs, explain briefly in your dry in-character voice, then give a corrected version in a fenced code block.' },
            { role: 'user', content: code },
          ],
        }),
      });
      const data = await res.json();
      setOutput(data?.choices?.[0]?.message?.content?.trim() || 'No response.');
    } catch (e) {
      setOutput('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrap title="Code Terminal" accent={accent} onBack={onBack}>
      <Label>PASTE CODE</Label>
      <TextInput
        style={[sharedInput, { minHeight: 120, fontFamily: 'monospace', fontSize: 12 }]}
        multiline
        value={code}
        onChangeText={setCode}
        placeholder="Paste code here..."
        placeholderTextColor={TEXT_DIM}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <PrimaryButton label="Check" accent={accent} onPress={check} style={{ flex: 1 }} />
        <PrimaryButton label={busy ? 'Asking...' : 'Ask Jarvis'} accent={accent} onPress={askJarvis} disabled={busy} style={{ flex: 1 }} />
      </View>
      {output ? (
        <ScrollView style={styles.output}>
          <Text style={{ color: TEXT, fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}>{output}</Text>
        </ScrollView>
      ) : null}
      <Text style={styles.note}>
        Honest limit: this checks brackets locally and can ask Jarvis to review, but it can't actually execute
        code on your phone - the web prototype's "Run" button used a browser JS sandbox that doesn't exist in a
        native app. A real code-runner here would need a scripting engine bundled in (possible, but a separate
        feature - ask if you want it).
      </Text>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  output: { marginTop: 14, padding: 12, backgroundColor: PANEL2, borderRadius: 12, maxHeight: 260 },
  note: { color: TEXT_DIM, fontSize: 11, lineHeight: 16, marginTop: 14 },
});
