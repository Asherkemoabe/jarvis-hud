import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenWrap, PrimaryButton, Empty } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, LINE } from '../theme';

export default function FilesScreen({ accent, onBack }) {
  const [files, setFiles] = useState([]);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (res.canceled) return;
    setFiles((prev) => [...res.assets, ...prev]);
  };

  return (
    <ScreenWrap title="Files" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <PrimaryButton label="Pick files" accent={accent} onPress={pick} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={files}
        keyExtractor={(f, i) => f.uri + i}
        ListEmptyComponent={<Empty text="No files picked yet." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.sub}>{item.mimeType || 'unknown type'} · {Math.round((item.size || 0) / 1024)} KB</Text>
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
});
