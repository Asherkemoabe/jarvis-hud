import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import * as Calendar from 'expo-calendar';
import { ScreenWrap, PrimaryButton, Empty, Label, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

export default function CalendarScreen({ accent, onBack }) {
  const [granted, setGranted] = useState(null);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setGranted(status === 'granted');
      if (status === 'granted') load();
    })();
  }, []);

  const load = async () => {
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (!cals.length) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    const evs = await Calendar.getEventsAsync(cals.map((c) => c.id), start, end);
    setEvents(evs.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
  };

  const addEvent = async () => {
    if (!title.trim()) return;
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = cals.find((c) => c.allowsModifications) || cals[0];
    if (!writable) return;
    const start = new Date();
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 30 * 60000);
    await Calendar.createEventAsync(writable.id, { title: title.trim(), startDate: start, endDate: end });
    setTitle('');
    load();
  };

  if (granted === false) {
    return (
      <ScreenWrap title="Calendar" accent={accent} onBack={onBack}>
        <Text style={styles.note}>Calendar permission was denied. Enable it in Android Settings → Apps → Jarvis → Permissions to use this.</Text>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap title="Calendar & Reminders" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <Label>NEW EVENT (starts in 1 hour, 30 min)</Label>
        <TextInput style={sharedInput} value={title} onChangeText={setTitle} placeholder="Event title" placeholderTextColor={TEXT_DIM} />
        <PrimaryButton label="Add to calendar" accent={accent} onPress={addEvent} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={events}
        keyExtractor={(e) => e.id}
        ListEmptyComponent={<Empty text="No events in the next 14 days." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.startDate).toLocaleString()}</Text>
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT, fontWeight: '600' },
  date: { color: TEXT_DIM, fontSize: 12, marginTop: 4 },
  note: { color: TEXT_DIM, lineHeight: 20 },
});
