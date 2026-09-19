import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenWrap, Card, PrimaryButton, Label, sharedInput } from '../components/UI';
import { THEMES, TEXT } from '../theme';

export default function SettingsScreen({ accent, apiKey, onSaveKey, onPickTheme, onBack }) {
  const [draft, setDraft] = useState('');

  return (
    <ScreenWrap title="Settings" accent={accent} onBack={onBack}>
      <Card>
        <Label>GROQ API KEY (free at console.groq.com)</Label>
        <TextInput
          style={sharedInput}
          defaultValue={apiKey}
          onChangeText={setDraft}
          placeholder="gsk_..."
          placeholderTextColor="#5f7d84"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton label="Save key" accent={accent} onPress={() => onSaveKey(draft)} />
      </Card>

      <Card>
        <Label>HUD COLOR</Label>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.color}
              onPress={() => onPickTheme(t.color)}
              style={[styles.swatch, { backgroundColor: t.color, borderWidth: accent === t.color ? 2 : 0 }]}
            />
          ))}
        </View>
      </Card>

      <Text style={styles.note}>
        The API key is stored only on this device (AsyncStorage) — it is never written to any file in this
        project's source code.
      </Text>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  swatch: { width: 32, height: 32, borderRadius: 16, borderColor: '#fff' },
  note: { color: '#5f7d84', fontSize: 11, lineHeight: 16, marginTop: 4 },
});
