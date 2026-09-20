import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Reactor from '../components/Reactor';
import Dock from '../components/Dock';
import { ScreenWrap } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

// Jarvis decides, per message, whether to just reply or also open one of
// the app's feature screens. It always returns JSON: { reply, screen }.
// "screen" is one of the keys below, or null for plain conversation.
const SCREEN_KEYS = [
  'expenses', 'calendar', 'reminders', 'notes', 'weather', 'news', 'study',
  'translate', 'places', 'contacts', 'camera', 'files', 'fitness', 'device',
  'vault', 'launcher', 'bridge', 'settings', 'code',
  'email', 'social', 'callscreen', 'smarthome', 'gaming',
];

const SYSTEM_PROMPT = `You are JARVIS, a concise, dry-witted AI assistant. Address the user as "sir".
This app has separate screens for specific tasks. When the user's message clearly asks for one of
these, open it. Otherwise just chat normally.

Screens: expenses (log/view spending in Pula), calendar (events), reminders (reminders/medication),
notes (journaling), weather (weather/location), news (headlines), study (learn a topic),
translate (translate text), places (nearby businesses), contacts (look up a contact),
camera (take/pick a photo), files (pick a file), fitness (step count), device (battery/network),
vault (save/retrieve a password), launcher (open another app), bridge (send WhatsApp/SMS),
settings (change HUD color or API key), code (paste code to check or ask you to review it),
email/social/callscreen/smarthome/gaming (not available yet
in this build - open these anyway so the user sees why).

Reply with ONLY a JSON object, no markdown fences, no extra text:
{"reply": "<your short in-character reply>", "screen": "<one of: ${SCREEN_KEYS.join(', ')}, or null>"}`;

const HISTORY_LIMIT = 10;

function safeParse(raw) {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.reply === 'string') {
      return { reply: parsed.reply, screen: SCREEN_KEYS.includes(parsed.screen) ? parsed.screen : null };
    }
  } catch (e) {
    // model didn't return valid JSON - fall back to treating it as plain text
  }
  return { reply: raw, screen: null };
}

export default function ChatScreen({ accent, apiKey, onNeedKey, onOpenScreen, onOpenCode }) {
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
      const raw = data?.choices?.[0]?.message?.content?.trim() || data?.error?.message || '{"reply":"I had trouble forming a reply, sir.","screen":null}';
      const { reply, screen } = safeParse(raw);
      setMessages((p) => [...p, { id: Date.now() + '-j', role: 'jarvis', text: reply }]);
      if (screen && onOpenScreen) {
        setTimeout(() => onOpenScreen(screen), 500);
      }
    } catch (e) {
      setMessages((p) => [...p, { id: Date.now() + '-e', role: 'jarvis', text: 'Connection error: ' + e.message }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenWrap title="J.A.R.V.I.S." subtitle="JARVIS SYSTEMS // ONLINE" accent={accent} scroll={false}>
      <Dock accent={accent} onOpenCode={onOpenCode} />
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
