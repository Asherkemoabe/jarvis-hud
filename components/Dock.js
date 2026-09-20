import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Magnetometer } from 'expo-sensors';
import { PANEL2, LINE, TEXT_DIM } from '../theme';

// PULSE = real device vibration (expo-haptics). TILT = real compass heading
// from the magnetometer (expo-sensors). CODE = opens the Code Terminal screen.
// These are native-API equivalents of what the web HUD did with the
// Vibration API / DeviceOrientation / a browser sandbox - same idea,
// phone-native implementation.
export default function Dock({ accent, onOpenCode }) {
  const [heading, setHeading] = useState(null);
  const [watching, setWatching] = useState(false);
  const subRef = useRef(null);

  useEffect(() => () => { subRef.current && subRef.current.remove(); }, []);

  const pulse = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
  };

  const toggleTilt = () => {
    if (watching) {
      subRef.current && subRef.current.remove();
      subRef.current = null;
      setWatching(false);
      setHeading(null);
      return;
    }
    Magnetometer.setUpdateInterval(300);
    subRef.current = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setHeading(Math.round(angle));
    });
    setWatching(true);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={pulse}>
        <Text style={styles.icon}>📳</Text>
        <Text style={styles.label}>PULSE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, watching && { borderColor: accent }]} onPress={toggleTilt}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={[styles.label, watching && { color: accent }]}>{watching ? (heading != null ? heading + '°' : 'TILT') : 'TILT'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onOpenCode}>
        <Text style={styles.icon}>💻</Text>
        <Text style={styles.label}>CODE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PANEL2, borderWidth: 1, borderColor: LINE, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  icon: { fontSize: 14 },
  label: { color: TEXT_DIM, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
});
