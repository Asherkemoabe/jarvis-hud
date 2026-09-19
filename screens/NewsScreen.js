import React, { useEffect, useState } from 'react';
import { Text, FlatList, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { parse } from 'react-native-rss-parser';
import { ScreenWrap, Empty } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

// BBC's public RSS feed — free, no API key, no card required.
const FEED_URL = 'https://feeds.bbci.co.uk/news/world/rss.xml';

export default function NewsScreen({ accent, onBack }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(FEED_URL)
      .then((r) => r.text())
      .then((xml) => parse(xml))
      .then((feed) => setItems(feed.items.slice(0, 20)))
      .catch(() => setError('Could not load the news feed.'));
  }, []);

  return (
    <ScreenWrap title="News Briefing" accent={accent} onBack={onBack} scroll={false}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        data={items}
        keyExtractor={(i, idx) => i.id || idx.toString()}
        ListEmptyComponent={<Empty text={error ? '—' : 'Loading headlines...'} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => item.links[0] && Linking.openURL(item.links[0].url)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.published}</Text>
          </TouchableOpacity>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  title: { color: TEXT, fontWeight: '600' },
  date: { color: TEXT_DIM, fontSize: 11, marginTop: 4 },
  error: { color: '#ff4d5e', padding: 16 },
});
