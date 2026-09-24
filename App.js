import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './theme';

import MainScreen from './screens/MainScreen';
import CodeScreen from './screens/CodeScreen';
import NotesScreen from './screens/NotesScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import VaultScreen from './screens/VaultScreen';
import DeviceStatusScreen from './screens/DeviceStatusScreen';
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

// Jarvis (in ChatScreen) is the only thing that navigates between these -
// there is no menu/button grid. Chat is always where you land and always
// where "Back" returns you to.
const UNAVAILABLE = {
  callscreen: {
    title: 'Call Screening',
    reason: 'Screening/blocking calls needs Android\'s native CallScreeningService. Expo\'s managed workflow doesn\'t expose that API at all.',
    nextStep: 'Requires ejecting to bare React Native ("expo prebuild") and writing a native Android module. A bigger, separate project - ask me to scope it once the rest of the app is stable.',
  },
  smarthome: {
    title: 'Smart Home Control',
    reason: 'This needs YOUR specific devices\' API (Philips Hue, Tuya, etc.) - there\'s no generic "smart home" API to wire up without knowing what you own.',
    nextStep: 'Tell me your smart home brand/hub and I\'ll wire up that specific local API - most (Hue, Tuya local mode) are free and don\'t need cloud accounts.',
  },
  email: {
    title: 'Email Read/Draft',
    reason: 'Reading/drafting Gmail needs an OAuth app registered in Google Cloud Console - that\'s an account + a few manual setup screens only you can do (I can\'t create it on your behalf).',
    nextStep: 'Create a free Google Cloud project, enable the Gmail API, generate an OAuth client ID, and send me the client ID - I\'ll wire the rest into the app.',
  },
  social: {
    title: 'Social Media Posting',
    reason: 'Each platform (Instagram, X, etc.) needs its own developer app + OAuth approval, and some now charge for API access.',
    nextStep: 'Pick one platform, register a developer app for it (I\'ll walk you through it), and send me the API key/token to wire in.',
  },
  gaming: {
    title: 'Gaming Coach',
    reason: 'Watching your screen live needs Android\'s MediaProjection (screen capture) API plus OCR running on each frame - a heavy native feature outside Expo managed workflow.',
    nextStep: 'Needs a custom dev client (not Expo Go) with a native screen-capture module. Worth doing as its own project once the core app is solid.',
  },
};

export default function App() {
  const [screen, setScreen] = useState('main');
  const [mainTab, setMainTab] = useState('chat');
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

  const backToMain = () => setScreen('main');
  const commonProps = { accent, onBack: backToMain };

  // Jarvis in ChatScreen calls this to navigate. "settings" switches the
  // tab inside MainScreen rather than pushing a separate screen, since
  // Settings lives in the tab bar now, not as its own overlay.
  const handleOpenScreen = (key) => {
    if (key === 'settings') {
      setMainTab('settings');
      setScreen('main');
      return;
    }
    setScreen(key);
  };

  if (screen === 'code') return <CodeScreen {...commonProps} apiKey={apiKey} onNeedKey={() => handleOpenScreen('settings')} />;
  if (screen === 'notes') return <NotesScreen {...commonProps} />;
  if (screen === 'expenses') return <ExpensesScreen {...commonProps} />;
  if (screen === 'vault') return <VaultScreen {...commonProps} />;
  if (screen === 'device') return <DeviceStatusScreen {...commonProps} />;
  if (screen === 'bridge') return <BridgeScreen {...commonProps} />;
  if (screen === 'calendar') return <CalendarScreen {...commonProps} />;
  if (screen === 'contacts') return <ContactsScreen {...commonProps} />;
  if (screen === 'camera') return <CameraScreen {...commonProps} />;
  if (screen === 'files') return <FilesScreen {...commonProps} />;
  if (screen === 'weather') return <LocationWeatherScreen {...commonProps} />;
  if (screen === 'fitness') return <FitnessScreen {...commonProps} />;
  if (screen === 'reminders') return <RemindersScreen {...commonProps} />;
  if (screen === 'translate') return <TranslateScreen {...commonProps} apiKey={apiKey} onNeedKey={() => handleOpenScreen('settings')} />;
  if (screen === 'study') return <StudyScreen {...commonProps} apiKey={apiKey} onNeedKey={() => handleOpenScreen('settings')} />;
  if (screen === 'news') return <NewsScreen {...commonProps} />;
  if (screen === 'places') return <PlacesScreen {...commonProps} />;
  if (UNAVAILABLE[screen]) return <UnavailableScreen {...commonProps} {...UNAVAILABLE[screen]} />;

  return (
    <MainScreen
      tab={mainTab}
      onTabChange={setMainTab}
      accent={accent}
      apiKey={apiKey}
      onSaveKey={saveKey}
      onPickTheme={pickTheme}
      onNeedKey={() => setMainTab('settings')}
      onOpenScreen={handleOpenScreen}
    />
  );
}
