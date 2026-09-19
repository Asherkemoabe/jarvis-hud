import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { ScreenWrap, Card, Label } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

export default function DeviceStatusScreen({ accent, onBack }) {
  const [battery, setBattery] = useState(null);
  const [charging, setCharging] = useState(null);
  const [net, setNet] = useState(null);

  useEffect(() => {
    Battery.getBatteryLevelAsync().then((l) => setBattery(Math.round(l * 100)));
    Battery.getBatteryStateAsync().then((st) => setCharging(st === Battery.BatteryState.CHARGING));
    Network.getNetworkStateAsync().then(setNet);
    const sub = Battery.addBatteryLevelListener(({ batteryLevel }) => setBattery(Math.round(batteryLevel * 100)));
    return () => sub && sub.remove();
  }, []);

  const tip =
    battery !== null && battery < 20
      ? "Battery's low — worth switching to Wi-Fi and lowering screen brightness."
      : net && net.type === 'CELLULAR'
      ? "You're on mobile data — background sync from other features will use it, so keep that in mind."
      : 'Nothing urgent — battery and connection both look fine.';

  return (
    <ScreenWrap title="Device Status" accent={accent} onBack={onBack}>
      <Card>
        <Label>BATTERY</Label>
        <Text style={styles.big}>{battery === null ? '…' : `${battery}%`} {charging ? '⚡ charging' : ''}</Text>
      </Card>
      <Card>
        <Label>NETWORK</Label>
        <Text style={styles.big}>{net ? net.type : '…'}</Text>
        <Text style={styles.sub}>{net ? (net.isConnected ? 'Connected' : 'Offline') : ''}</Text>
      </Card>
      <Card>
        <Label>TIP</Label>
        <Text style={styles.tip}>{tip}</Text>
      </Card>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  big: { color: TEXT, fontSize: 22, fontWeight: '700' },
  sub: { color: TEXT_DIM, marginTop: 2 },
  tip: { color: TEXT_DIM, lineHeight: 20 },
});
