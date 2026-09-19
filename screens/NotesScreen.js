import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrap, PrimaryButton, Empty, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, DANGER, LINE } from '../theme';

const KEY = 'jarvis_notes';

export default function NotesScreen({ accent, onBack }) {
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setNotes(JSON.parse(v)));
  }, []);

  const persist = async (next) => {
    setNotes(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!draft.trim()) return;
    persist([{ id: Date.now().toString(), text: draft.trim(), date: new Date().toLocaleString() }, ...notes]);
    setDraft('');
  };

  const remove = (id) => persist(notes.filter((n) => n.id !== id));

  return (
    <ScreenWrap title="Notes & Journal" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <TextInput style={[sharedInput, { minHeight: 60 }]} multiline value={draft} onChangeText={setDraft} placeholder="Write a note..." placeholderTextColor={TEXT_DIM} />
        <PrimaryButton label="Add note" accent={accent} onPress={add} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={notes}
        keyExtractor={(n) => n.id}
        ListEmptyComponent={<Empty text="No notes yet." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={{ color: DANGER }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE, gap: 10, alignItems: 'flex-start' },
  text: { color: TEXT },
  date: { color: TEXT_DIM, fontSize: 11, marginTop: 4 },
});
