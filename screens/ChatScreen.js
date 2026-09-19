import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Reactor from '../components/Reactor';
import { ScreenWrap } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

const SYSTEM_PROMPT = 'You are JARVIS, a concise, dry-witted AI assistant. Address the user as "sir". Keep replies short unless asked for detail.';
const HISTORY_LIMIT = 10;

export default function ChatScreen({ accent, apiKey, onBack, onNeedKey }) {
  const [messages, setMessages] = useState([{ id: 'boot', role: 'jarvis', text: 'All systems online. How can I help, sir?' }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    if (!apiKey) {
      Alert.alert('No API key', 'Add your free Groq API key in Settings first.');
      onNeedKey && onNeedKey();
      return;
    }
    const next = [...messages, { id: Date.now() + '-u', role: 'user', text }];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const recent = next.slice(-HISTORY_LIMIT);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...recent.map((m) => ({ role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text }))],
        }),
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || data?.error?.message || 'I had trouble forming a reply, sir.';
      setMessages((p) => [...p, { id: Date.now() + '-j', role: 'jarvis', text: reply }]);
    } catch (e) {
      setMessages((p) => [...p, { id: Date.now() + '-e', role: 'jarvis', text: 'Connection error: ' + e.message }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenWrap title="J.A.R.V.I.S." accent={accent} onBack={onBack} scroll={false}>
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 170 }}>
        <Reactor size={200} color={accent} />
      </View>
      <FlatList
        ref={listRef}
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={messages}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.jarvis]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Message Jarvis..." placeholderTextColor={TEXT_DIM} onSubmitEditing={send} returnKeyType="send" />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: accent }]} onPress={send} disabled={sending}>
            <Text style={{ color: '#04070a', fontWeight: 'bold' }}>{sending ? '…' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  bubble: { padding: 10, borderRadius: 14, marginVertical: 4, maxWidth: '80%' },
  bubbleText: { color: TEXT, fontSize: 15 },
  user: { alignSelf: 'flex-end', backgroundColor: 'rgba(60,232,201,0.15)' },
  jarvis: { alignSelf: 'flex-start', backgroundColor: PANEL2 },
  inputBar: { flexDirection: 'row', padding: 12, gap: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: LINE },
  input: { flex: 1, backgroundColor: PANEL2, color: TEXT, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
