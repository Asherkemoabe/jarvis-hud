import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScreenWrap, PrimaryButton, Empty, Label, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, DANGER, LINE } from '../theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// Covers general reminders and medication reminders — both are just
// "notify me at time X", which is a genuine local notification, no
// Health Connect or cloud service required.
export default function RemindersScreen({ accent, onBack }) {
  const [title, setTitle] = useState('');
  const [minutesFromNow, setMinutesFromNow] = useState('30');
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.getAllScheduledNotificationsAsync().then(setScheduled);
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    const mins = parseInt(minutesFromNow, 10) || 30;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Jarvis reminder', body: title.trim() },
      trigger: { seconds: mins * 60 },
    });
    setTitle('');
    Notifications.getAllScheduledNotificationsAsync().then(setScheduled);
  };

  const cancel = async (id) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    Notifications.getAllScheduledNotificationsAsync().then(setScheduled);
  };

  return (
    <ScreenWrap title="Reminders" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <Label>NEW REMINDER (e.g. medication, task)</Label>
        <TextInput style={sharedInput} value={title} onChangeText={setTitle} placeholder="Take medication" placeholderTextColor={TEXT_DIM} />
        <TextInput style={[sharedInput, { marginTop: 8 }]} value={minutesFromNow} onChangeText={setMinutesFromNow} placeholder="Minutes from now" placeholderTextColor={TEXT_DIM} keyboardType="numeric" />
        <PrimaryButton label="Schedule reminder" accent={accent} onPress={add} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={scheduled}
        keyExtractor={(n) => n.identifier}
        ListEmptyComponent={<Empty text="No reminders scheduled." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.content.body}</Text>
            <TouchableOpacity onPress={() => cancel(item.identifier)}><Text style={{ color: DANGER }}>Cancel</Text></TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT, flex: 1, marginRight: 10 },
});
