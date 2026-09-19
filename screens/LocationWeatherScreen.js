import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { ScreenWrap, Card, PrimaryButton, Label } from '../components/UI';
import { TEXT, TEXT_DIM } from '../theme';

// Weather via Open-Meteo — genuinely free, no API key required, no card needed.
export default function LocationWeatherScreen({ accent, onBack }) {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords(pos.coords);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,weather_code,wind_speed_10m`
        );
        const data = await res.json();
        setWeather(data.current);
      } catch (e) {
        setError('Could not reach the weather service.');
      }
    })();
  }, []);

  const openMaps = () => {
    if (!coords) return;
    Linking.openURL(`geo:${coords.latitude},${coords.longitude}?q=${coords.latitude},${coords.longitude}`);
  };

  return (
    <ScreenWrap title="Weather & Location" accent={accent} onBack={onBack}>
      {error && <Text style={styles.note}>{error}</Text>}
      <Card>
        <Label>CURRENT WEATHER</Label>
        {weather ? (
          <>
            <Text style={styles.big}>{Math.round(weather.temperature_2m)}°C</Text>
            <Text style={styles.sub}>Wind {Math.round(weather.wind_speed_10m)} km/h</Text>
          </>
        ) : (
          <Text style={styles.sub}>{error ? '—' : 'Loading...'}</Text>
        )}
      </Card>
      <Card>
        <Label>YOUR LOCATION</Label>
        <Text style={styles.sub}>{coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : '—'}</Text>
        <PrimaryButton label="Open in Maps" accent={accent} onPress={openMaps} disabled={!coords} />
      </Card>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  big: { color: TEXT, fontSize: 28, fontWeight: '700' },
  sub: { color: TEXT_DIM, marginTop: 2 },
  note: { color: '#ff4d5e', marginBottom: 10 },
});
