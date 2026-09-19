import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { ScreenWrap, PrimaryButton, Empty, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

// OpenStreetMap Nominatim — genuinely free, no API key, no credit card,
// unlike Google Places (which now requires a card on file even for its
// free tier).
export default function PlacesScreen({ accent, onBack }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    try {
      let viewbox = '';
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        const d = 0.2;
        viewbox = `&viewbox=${pos.coords.longitude - d},${pos.coords.latitude + d},${pos.coords.longitude + d},${pos.coords.latitude - d}&bounded=0`;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json${viewbox}`,
        { headers: { 'User-Agent': 'JarvisHUD/1.0' } }
      );
      setResults(await res.json());
    } catch (e) {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenWrap title="Local Places" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <TextInput style={sharedInput} value={query} onChangeText={setQuery} placeholder="e.g. pharmacy, ATM, restaurant" placeholderTextColor={TEXT_DIM} onSubmitEditing={search} />
        <PrimaryButton label={busy ? 'Searching...' : 'Search'} accent={accent} onPress={search} disabled={busy} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={results}
        keyExtractor={(r) => r.place_id?.toString()}
        ListEmptyComponent={<Empty text="No results yet." />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`geo:${item.lat},${item.lon}?q=${item.lat},${item.lon}`)}>
            <Text style={styles.text}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT },
});
