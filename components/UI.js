import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { BG, PANEL2, LINE, TEXT, TEXT_DIM } from '../theme';

export function ScreenWrap({ title, subtitle, accent, onBack, children, scroll = true }) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={10} style={s.backBtn}>
            <Text style={[s.backText, { color: accent }]}>{'‹'} Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.backBtn} />
        )}
        <View style={{ alignItems: 'center' }}>
          <Text style={[s.title, { color: accent }]}>{title}</Text>
          {subtitle ? <Text style={[s.subtitle, { color: accent }]}>{subtitle}</Text> : null}
        </View>
        <View style={s.backBtn} />
      </View>
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { padding: 16, paddingBottom: 40 } : undefined}>
        {children}
      </Body>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, accent, disabled, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, { backgroundColor: accent, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={s.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Empty({ text }) {
  return <Text style={s.empty}>{text}</Text>;
}

export function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  backBtn: { width: 70 },
  backText: { fontSize: 14 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  subtitle: { fontSize: 10, letterSpacing: 1, marginTop: 2, opacity: 0.8 },
  card: { backgroundColor: PANEL2, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: LINE },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#04070a', fontWeight: '700' },
  empty: { color: TEXT_DIM, textAlign: 'center', marginTop: 30 },
  label: { color: TEXT_DIM, fontSize: 12, letterSpacing: 1, marginBottom: 6 },
});

export const sharedInput = {
  backgroundColor: PANEL2,
  color: TEXT,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderWidth: 1,
  borderColor: LINE,
};
