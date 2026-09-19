import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrap, PrimaryButton, Card } from '../components/UI';
import { TEXT_DIM } from '../theme';

export default function CameraScreen({ accent, onBack }) {
  const [photo, setPhoto] = useState(null);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  return (
    <ScreenWrap title="Camera / Photos" accent={accent} onBack={onBack}>
      <Card>
        <PrimaryButton label="Take a photo" accent={accent} onPress={takePhoto} />
        <PrimaryButton label="Pick from gallery" accent={accent} onPress={pickPhoto} style={{ marginTop: 10 }} />
      </Card>
      {photo && (
        <Card>
          <Image source={{ uri: photo }} style={styles.preview} />
        </Card>
      )}
      <Text style={styles.note}>
        Document scanning (OCR) isn't wired in yet — real offline OCR needs Google ML Kit, which requires
        Google Play Services. If your phone has GMS, ask me to add `expo-text-recognition` next.
      </Text>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', height: 260, borderRadius: 12 },
  note: { color: TEXT_DIM, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
