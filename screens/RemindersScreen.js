import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScreenWrap, Empty } from '../components/UI';
import { PANEL2, TEXT, DANGER, LINE, TEXT_DIM } from '../theme';

// Creation now happens through Jarvis in chat ("remind me to take my
// pills at 8pm") - it schedules the notification directly, no form here.
// This screen is just for viewing/cancelling what's already scheduled.
export default function RemindersScreen({ accent, onBack }) {
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    Notifications.getAllScheduledNotificationsAsync().then(setScheduled);
  }, []);

  const cancel = async (id) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    Notifications.getAllScheduledNotificationsAsync().then(setScheduled);
  };

  return (
    <ScreenWrap title="Reminders" accent={accent} onBack={onBack} scroll={false}>
      <Text style={styles.hint}>Tell Jarvis in chat to set a new reminder - this screen is just for viewing or cancelling what's already scheduled.</Text>
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
  hint: { color: TEXT_DIM, fontSize: 12, lineHeight: 17, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT, flex: 1, marginRight: 10 },
});
