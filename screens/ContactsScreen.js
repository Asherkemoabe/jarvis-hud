import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';
import { ScreenWrap, Empty, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

export default function ContactsScreen({ accent, onBack }) {
  const [granted, setGranted] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setGranted(status === 'granted');
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
        setContacts(data.filter((c) => c.name));
      }
    })();
  }, []);

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 100);

  if (granted === false) {
    return (
      <ScreenWrap title="Contacts" accent={accent} onBack={onBack}>
        <Text style={styles.note}>Contacts permission was denied. Enable it in Android Settings → Apps → Jarvis → Permissions.</Text>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap title="Contacts" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <TextInput style={sharedInput} value={query} onChangeText={setQuery} placeholder="Search contacts..." placeholderTextColor={TEXT_DIM} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={filtered}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<Empty text={granted ? 'No matches.' : 'Loading...'} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.name}</Text>
            {item.phoneNumbers && item.phoneNumbers[0] ? <Text style={styles.sub}>{item.phoneNumbers[0].number}</Text> : null}
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT, fontWeight: '600' },
  sub: { color: TEXT_DIM, fontSize: 12, marginTop: 2 },
  note: { color: TEXT_DIM, lineHeight: 20 },
});
