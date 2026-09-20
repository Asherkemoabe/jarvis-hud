import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { TEXT_DIM } from '../theme';

// Real device data, not decoration: live clock, real battery %, real
// online/offline state.
export default function HudStatusBar({ accent }) {
  const [time, setTime] = useState('');
  const [battery, setBattery] = useState(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Battery.getBatteryLevelAsync().then((l) => setBattery(Math.round(l * 100)));
    const sub = Battery.addBatteryLevelListener(({ batteryLevel }) => setBattery(Math.round(batteryLevel * 100)));
    Network.getNetworkStateAsync().then((n) => setOnline(!!n.isConnected));
    return () => sub && sub.remove();
  }, []);

  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: accent }]}>{time}</Text>
      <View style={styles.right}>
        <View style={styles.statusItem}>
          <View style={[styles.dot, { backgroundColor: online ? '#3ddc84' : '#ff4d5e' }]} />
          <Text style={styles.dim}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
        <Text style={styles.dim}>{battery === null ? 'BATT --' : `BATT ${battery}%`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  time: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  right: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dim: { color: TEXT_DIM, fontSize: 10, letterSpacing: 1 },
});
