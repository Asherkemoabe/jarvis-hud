import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LINE, TEXT_DIM } from '../theme';

export default function TabBar({ tab, onChange, accent }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.tab, tab === 'chat' && { borderColor: accent }]} onPress={() => onChange('chat')}>
        <Text style={[styles.label, tab === 'chat' && { color: accent }]}>💬 CHAT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, tab === 'settings' && { borderColor: accent }]} onPress={() => onChange('settings')}>
        <Text style={[styles.label, tab === 'settings' && { color: accent }]}>⚙ SETTINGS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  tab: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  label: { color: TEXT_DIM, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
});
