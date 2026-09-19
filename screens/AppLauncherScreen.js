import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { ScreenWrap, Card } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

// Opens other apps by URL scheme / package name. This is the real ceiling
// for "app launching" in a managed Expo app: it can OPEN an app, it can't
// tap buttons inside it (that needs Accessibility Service — a separate,
// much heavier feature).
const APPS = [
  { name: 'WhatsApp', scheme: 'whatsapp://send', android: 'com.whatsapp' },
  { name: 'Camera', scheme: 'null', android: null, useCamera: true },
  { name: 'Phone dialer', scheme: 'tel:', android: null },
  { name: 'Browser', scheme: 'https://google.com', android: null },
  { name: 'Maps', scheme: 'geo:0,0', android: 'com.google.android.apps.maps' },
  { name: 'Settings', scheme: 'app-settings:', android: null },
];

async function openApp(app) {
  try {
    if (Platform.OS === 'android' && app.android) {
      const url = `intent://#Intent;package=${app.android};end`;
      await Linking.openURL(url);
      return;
    }
    await Linking.openURL(app.scheme);
  } catch (e) {
    // fall back silently — most likely the target app isn't installed
  }
}

export default function AppLauncherScreen({ accent, onBack }) {
  return (
    <ScreenWrap title="App Launcher" accent={accent} onBack={onBack}>
      <Card>
        <Text style={styles.note}>Opens the app. Can't control what happens inside it — see README for why.</Text>
      </Card>
      <View style={styles.grid}>
        {APPS.map((a) => (
          <TouchableOpacity key={a.name} style={[styles.tile, { borderColor: accent }]} onPress={() => openApp(a)}>
            <Text style={styles.tileText}>{a.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  note: { color: TEXT_DIM, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  tileText: { color: TEXT, fontWeight: '600' },
});
