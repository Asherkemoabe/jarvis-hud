import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrap, PrimaryButton, Empty, sharedInput } from '../components/UI';
import { PANEL2, TEXT, TEXT_DIM, DANGER, LINE } from '../theme';

const KEY = 'jarvis_expenses';

export default function ExpensesScreen({ accent, onBack }) {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setItems(JSON.parse(v)));
  }, []);

  const persist = async (next) => {
    setItems(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = () => {
    const n = parseFloat(amount);
    if (!label.trim() || isNaN(n)) return;
    persist([{ id: Date.now().toString(), label: label.trim(), amount: n, date: new Date().toLocaleDateString() }, ...items]);
    setLabel('');
    setAmount('');
  };

  const remove = (id) => persist(items.filter((i) => i.id !== id));
  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <ScreenWrap title="Expenses" accent={accent} onBack={onBack} scroll={false}>
      <View style={{ padding: 16 }}>
        <Text style={[styles.total, { color: accent }]}>Total: P {total.toFixed(2)}</Text>
        <TextInput style={sharedInput} value={label} onChangeText={setLabel} placeholder="What did you buy?" placeholderTextColor={TEXT_DIM} />
        <TextInput style={[sharedInput, { marginTop: 8 }]} value={amount} onChangeText={setAmount} placeholder="Amount (Pula)" placeholderTextColor={TEXT_DIM} keyboardType="numeric" />
        <PrimaryButton label="Add expense" accent={accent} onPress={add} />
      </View>
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Empty text="No expenses logged yet." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{item.label}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={[styles.amount, { color: accent }]}>P {item.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={{ color: DANGER, marginLeft: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  total: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: PANEL2, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: LINE },
  text: { color: TEXT },
  date: { color: TEXT_DIM, fontSize: 11, marginTop: 2 },
  amount: { fontWeight: '700' },
});
