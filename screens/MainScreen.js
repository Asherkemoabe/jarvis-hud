import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HudStatusBar from '../components/HudStatusBar';
import TabBar from '../components/TabBar';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import { BG } from '../theme';

export default function MainScreen({ tab, onTabChange, accent, apiKey, onSaveKey, onPickTheme, onNeedKey, onOpenScreen }) {
  return (
    <SafeAreaView style={styles.root}>
      <HudStatusBar accent={accent} />
      <TabBar tab={tab} onChange={onTabChange} accent={accent} />
      {tab === 'chat' ? (
        <ChatScreen
          accent={accent}
          apiKey={apiKey}
          onNeedKey={onNeedKey}
          onOpenScreen={onOpenScreen}
          onOpenCode={() => onOpenScreen('code')}
        />
      ) : (
        <SettingsScreen accent={accent} apiKey={apiKey} onSaveKey={onSaveKey} onPickTheme={onPickTheme} onBack={() => onTabChange('chat')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: BG } });
