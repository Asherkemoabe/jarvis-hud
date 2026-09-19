import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenWrap, Card } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

// Honest stub for features that genuinely cannot run inside a managed Expo
// app without extra infrastructure (OAuth app registration, ejecting to
// bare React Native, your own hardware's API, etc). Explains exactly why.
export default function UnavailableScreen({ title, accent, onBack, reason, nextStep }) {
  return (
    <ScreenWrap title={title} accent={accent} onBack={onBack}>
      <Card>
        <Text style={styles.heading}>Not wired up yet — here's why</Text>
        <Text style={styles.body}>{reason}</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>What it would take</Text>
        <Text style={styles.body}>{nextStep}</Text>
      </Card>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  heading: { color: TEXT, fontWeight: '700', marginBottom: 6 },
  body: { color: TEXT_DIM, lineHeight: 20 },
});
