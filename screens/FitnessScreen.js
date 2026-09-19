import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { ScreenWrap, Card, Label } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

export default function FitnessScreen({ accent, onBack }) {
  const [available, setAvailable] = useState(null);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setAvailable);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    Pedometer.getStepCountAsync(start, new Date()).then((r) => setSteps(r.steps)).catch(() => {});
    const sub = Pedometer.watchStepCount((r) => setSteps((s) => s + r.steps));
    return () => sub && sub.remove();
  }, []);

  return (
    <ScreenWrap title="Fitness" accent={accent} onBack={onBack}>
      <Card>
        <Label>STEPS TODAY</Label>
        <Text style={[styles.big, { color: accent }]}>{steps}</Text>
      </Card>
      {available === false && (
        <Text style={styles.note}>This device doesn't report a hardware step counter, so this may stay at 0.</Text>
      )}
      <Text style={styles.note}>
        This uses the phone's built-in step counter. Heart rate / workout tracking would need a wearable's own
        SDK — not something a phone-only app can read.
      </Text>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 36, fontWeight: '800' },
  note: { color: TEXT_DIM, fontSize: 12, lineHeight: 18, marginTop: 8 },
});
