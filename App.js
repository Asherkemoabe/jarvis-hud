import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, TEXT, TEXT_DIM, PANEL2, LINE, THEMES } from './theme';

import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotesScreen from './screens/NotesScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import VaultScreen from './screens/VaultScreen';
import DeviceStatusScreen from './screens/DeviceStatusScreen';
import AppLauncherScreen from './screens/AppLauncherScreen';
import BridgeScreen from './screens/BridgeScreen';
import CalendarScreen from './screens/CalendarScreen';
import ContactsScreen from './screens/ContactsScreen';
import CameraScreen from './screens/CameraScreen';
import FilesScreen from './screens/FilesScreen';
import LocationWeatherScreen from './screens/LocationWeatherScreen';
import FitnessScreen from './screens/FitnessScreen';
import RemindersScreen from './screens/RemindersScreen';
import TranslateScreen from './screens/TranslateScreen';
import StudyScreen from './screens/StudyScreen';
import NewsScreen from './screens/NewsScreen';
import PlacesScreen from './screens/PlacesScreen';
import UnavailableScreen from './screens/UnavailableScreen';

const SECTIONS = [
  {
    title: 'Core',
    tiles: [
      { key: 'chat', label: 'Jarvis Chat', icon: '💬' },
      { key: 'settings', label: 'Settings', icon: '⚙' },
    ],
  },
  {
    title: 'Messaging',
    tiles: [
      { key: 'bridge', label: 'WhatsApp / SMS', icon: '💬' },
      { key: 'email', label: 'Email', icon: '📧' },
      { key: 'social', label: 'Social Posting', icon: '📣' },
      { key: 'callscreen', label: 'Call Screening', icon: '📵' },
    ],
  },
  {
    title: 'Finance',
    tiles: [{ key: 'expenses', label: 'Expenses (Pula)', icon: '💰' }],
  },
  {
    title: 'Device',
    tiles: [
      { key: 'calendar', label: 'Calendar', icon: '📅' },
      { key: 'contacts', label: 'Contacts', icon: '👤' },
      { key: 'files', label: 'Files', icon: '📁' },
      { key: 'camera', label: 'Camera / Photos', icon: '📷' },
      { key: 'launcher', label: 'App Launcher', icon: '🚀' },
      { key: 'vault', label: 'Vault', icon: '🔒' },
      { key: 'device', label: 'Device Status', icon: '🔋' },
      { key: 'smarthome', label: 'Smart Home', icon: '🏠' },
    ],
  },
  {
    title: 'Life',
    tiles: [
      { key: 'weather', label: 'Weather & Location', icon: '🌦' },
      { key: 'news', label: 'News Briefing', icon: '📰' },
      { key: 'study', label: 'Study Assistant', icon: '📚' },
      { key: 'fitness', label: 'Fitness', icon: '🏃' },
      { key: 'reminders', label: 'Reminders / Health', icon: '💊' },
    ],
  },
  {
    title: 'Utility',
    tiles: [
      { key: 'translate', label: 'Translate', icon: '🌐' },
      { key: 'places', label: 'Local Places', icon: '📍' },
    ],
  },
  {
    title: 'Fun',
    tiles: [{ key: 'gaming', label: 'Gaming Coach', icon: '🎮' }],
  },
];

const UNAVAILABLE = {
  callscreen: {
    title: 'Call Screening',
    reason: 'Screening/blocking calls needs Android\'s native CallScreeningService. Expo\'s managed workflow doesn\'t expose that API at all.',
    nextStep: 'Requires ejecting to bare React Native ("expo prebuild") and writing a native Android module. A bigger, separate project — ask me to scope it once the rest of the app is stable.',
  },
  smarthome: {
    title: 'Smart Home Control',
    reason: 'This needs YOUR specific devices\' API (Philips Hue, Tuya, etc.) — there\'s no generic "smart home" API to wire up without knowing what you own.',
    nextStep: 'Tell me your smart home brand/hub and I\'ll wire up that specific local API — most (Hue, Tuya local mode) are free and don\'t need cloud accounts.',
  },
  email: {
    title: 'Email Read/Draft',
    reason: 'Reading/drafting Gmail needs an OAuth app registered in Google Cloud Console — that\'s an account + a few manual setup screens only you can do (I can\'t create it on your behalf).',
    nextStep: 'Create a free Google Cloud project, enable the Gmail API, generate an OAuth client ID, and send me the client ID — I\'ll wire the rest into the app.',
  },
  social: {
    title: 'Social Media Posting',
    reason: 'Each platform (Instagram, X, etc.) needs its own developer app + OAuth approval, and some now charge for API access.',
    nextStep: 'Pick one platform, register a developer app for it (I\'ll walk you through it), and send me the API key/token to wire in.',
  },
  gaming: {
    title: 'Gaming Coach',
    reason: 'Watching your screen live needs Android\'s MediaProjection (screen capture) API plus OCR running on each frame — a heavy native feature outside Expo managed workflow.',
    nextStep: 'Needs a custom dev client (not Expo Go) with a native screen-capture module. Worth doing as its own project once the core app is solid.',
  },
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [accent, setAccent] = useState(THEMES[0].color);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    (async () => {
      const savedKey = await AsyncStorage.getItem('groq_api_key');
      const savedAccent = await AsyncStorage.getItem('accent_color');
      if (savedKey) setApiKey(savedKey);
      if (savedAccent) setAccent(savedAccent);
    })();
  }, []);

  const saveKey = async (key) => {
    const trimmed = key.trim();
    await AsyncStorage.setItem('groq_api_key', trimmed);
    setApiKey(trimmed);
  };
  const pickTheme = async (color) => {
    setAccent(color);
    await AsyncStorage.setItem('accent_color', color);
  };

  const back = () => setScreen('home');
  const goSettings = () => setScreen('settings');

  const commonProps = { accent, onBack: back };

  if (screen === 'chat') return <ChatScreen {...commonProps} apiKey={apiKey} onNeedKey={goSettings} />;
  if (screen === 'settings') return <SettingsScreen {...commonProps} apiKey={apiKey} onSaveKey={saveKey} onPickTheme={pickTheme} />;
  if (screen === 'notes') return <NotesScreen {...commonProps} />;
  if (screen === 'expenses') return <ExpensesScreen {...commonProps} />;
  if (screen === 'vault') return <VaultScreen {...commonProps} />;
  if (screen === 'device') return <DeviceStatusScreen {...commonProps} />;
  if (screen === 'launcher') return <AppLauncherScreen {...commonProps} />;
  if (screen === 'bridge') return <BridgeScreen {...commonProps} />;
  if (screen === 'calendar') return <CalendarScreen {...commonProps} />;
  if (screen === 'contacts') return <ContactsScreen {...commonProps} />;
  if (screen === 'camera') return <CameraScreen {...commonProps} />;
  if (screen === 'files') return <FilesScreen {...commonProps} />;
  if (screen === 'weather') return <LocationWeatherScreen {...commonProps} />;
  if (screen === 'fitness') return <FitnessScreen {...commonProps} />;
  if (screen === 'reminders') return <RemindersScreen {...commonProps} />;
  if (screen === 'translate') return <TranslateScreen {...commonProps} apiKey={apiKey} onNeedKey={goSettings} />;
  if (screen === 'study') return <StudyScreen {...commonProps} apiKey={apiKey} onNeedKey={goSettings} />;
  if (screen === 'news') return <NewsScreen {...commonProps} />;
  if (screen === 'places') return <PlacesScreen {...commonProps} />;
  if (UNAVAILABLE[screen]) return <UnavailableScreen {...commonProps} {...UNAVAILABLE[screen]} />;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: accent }]}>J.A.R.V.I.S.</Text>
        <TouchableOpacity onPress={() => setScreen('chat')}>
          <Text style={{ color: accent, fontSize: 20 }}>💬</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 20 }}>
            <Text style={styles.section}>{section.title.toUpperCase()}</Text>
            <View style={styles.grid}>
              {section.tiles.map((t) => (
                <TouchableOpacity key={t.key} style={styles.tile} onPress={() => setScreen(t.key)}>
                  <Text style={styles.icon}>{t.icon}</Text>
                  <Text style={styles.label}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  section: { color: TEXT_DIM, fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', aspectRatio: 1, backgroundColor: PANEL2, borderRadius: 14, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6 },
  icon: { fontSize: 24 },
  label: { color: TEXT, fontSize: 11, textAlign: 'center' },
});
