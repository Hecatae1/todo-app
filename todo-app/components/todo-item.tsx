import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

type Todo = {
  id: string;
  title: string;
  notes?: string;
  datetime?: string; // ISO string
};

const formatDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

export default function TodoItem(): React.ReactElement {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeList, setShowTimeList] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setTitle('');
    setNotes('');
    setTempDate(null);
    setModalVisible(true);
    setShowCalendar(false);
    setShowTimeList(false);
  };

  const openEdit = (id: string) => {
    const item = todos.find((t) => t.id === id);
    if (!item) return;
    setEditingId(id);
    setTitle(item.title);
    setNotes(item.notes ?? '');
    setTempDate(item.datetime ? new Date(item.datetime) : null);
    setModalVisible(true);
    setShowCalendar(false);
    setShowTimeList(false);
  };

  const save = () => {
    if (!title.trim()) return;
    const iso = tempDate ? tempDate.toISOString() : '';
    if (editingId) {
      setTodos((prev: Todo[]) => prev.map((t) => (t.id === editingId ? { ...t, title: title.trim(), notes, datetime: iso } : t)));
    } else {
      setTodos((prev: Todo[]) => [...prev, { id: String(Date.now()), title: title.trim(), notes, datetime: iso }]);
    }
    setModalVisible(false);
  };

  const remove = (id: string) => setTodos((prev: Todo[]) => prev.filter((t) => t.id !== id));
  const removeAfterAnimation = (id: string) => setTodos((prev: Todo[]) => prev.filter((t) => t.id !== id));

  function TodoRow({ item }: { item: Todo }) {
    const opacity = useRef(new Animated.Value(1)).current;
    const [checked, setChecked] = useState(false);

    const onCheck = () => {
      if (checked) return;
      setChecked(true);
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => removeAfterAnimation(item.id));
    };

    return (
      <Animated.View style={[styles.rowAnimated, { opacity }]}>
        <Pressable onPress={onCheck} style={styles.checkboxWrap}>
          <Animated.View style={[styles.checkboxOutline, checked && styles.checkboxFilled]}>
            {checked ? <Text style={styles.checkMark}>✓</Text> : null}
          </Animated.View>
        </Pressable>

        <View style={styles.todoBody}>
          <Text style={styles.todoTitle}>{item.title}</Text>
          {item.notes ? <Text style={styles.todoNotes}>{item.notes}</Text> : null}
          {item.datetime ? <Text style={styles.todoDate}>{formatDateTime(item.datetime)}</Text> : null}
        </View>

        <View style={styles.rowActions}>
          <Pressable onPress={() => openEdit(item.id)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => remove(item.id)} style={styles.smallButton}>
            <Text style={[styles.smallButtonText, { color: '#c00' }]}>Delete</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // helpers
  const generateTimeOptions = (stepMinutes = 15): string[] => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return out;
  };

  const selectDay = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const base = tempDate ? new Date(tempDate) : new Date();
    base.setFullYear(y, m - 1, d);
    setTempDate(base);
    setShowCalendar(false);
  };

  const selectTime = (hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    const base = tempDate ? new Date(tempDate) : new Date();
    base.setHours(hh, mm, 0, 0);
    setTempDate(base);
    setShowTimeList(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={openAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(i: Todo) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No todos yet</Text>}
        renderItem={({ item }: { item: Todo }) => <TodoRow item={item} />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit To‑Do' : 'New To‑Do'}</Text>

            <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput
              placeholder="Notes"
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <View style={styles.dateRow}>
              <Text style={{ marginRight: 8, fontWeight: '600' }}>Date & Time:</Text>
              <Text style={styles.dateText}>{tempDate ? tempDate.toLocaleString() : 'None'}</Text>
            </View>

            <View style={styles.dateControls}>
              <Pressable onPress={() => setShowCalendar((s) => !s)} style={styles.smallControl}>
                <Text>Select date</Text>
              </Pressable>

              <Pressable onPress={() => setShowTimeList((s) => !s)} style={styles.smallControl}>
                <Text>Select time</Text>
              </Pressable>

              <Pressable onPress={() => setTempDate(null)} style={styles.smallControl}>
                <Text>Clear</Text>
              </Pressable>
            </View>

            {showCalendar ? (
              <View style={styles.calendarWrap}>
                <Calendar
                  onDayPress={(d: { dateString: string }) => selectDay(d.dateString)}
                  markedDates={tempDate ? { [tempDate.toISOString().slice(0, 10)]: { selected: true } } : {}}
                  current={tempDate ? tempDate.toISOString().slice(0, 10) : undefined}
                />
              </View>
            ) : null}

            {showTimeList ? (
              <View style={styles.timeListWrap}>
                <FlatList
                  data={generateTimeOptions(15)}
                  keyExtractor={(t: string) => t}
                  style={{ maxHeight: 240 }}
                  renderItem={({ item: t }: { item: string }) => (
                    <Pressable onPress={() => selectTime(t)} style={styles.timeRow}>
                      <Text>{t}</Text>
                    </Pressable>
                  )}
                />
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={[styles.modalBtn, styles.modalSave]}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  addButton: { backgroundColor: '#0066cc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#666', marginTop: 24 },

  rowAnimated: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkboxWrap: { marginRight: 12 },
  checkboxOutline: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#999', alignItems: 'center', justifyContent: 'center' },
  checkboxFilled: { backgroundColor: '#28a745', borderColor: '#28a745' },
  checkMark: { color: '#fff', fontWeight: '700' },

  todoBody: { flex: 1 },
  todoTitle: { fontSize: 16, fontWeight: '600' },
  todoNotes: { color: '#666' },
  todoDate: { color: '#999', fontSize: 12, marginTop: 4 },
  rowActions: { marginLeft: 12, flexDirection: 'row' },
  smallButton: { paddingHorizontal: 8, paddingVertical: 6 },
  smallButtonText: { color: '#0066cc' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  modalSave: { backgroundColor: '#0066cc', borderRadius: 6 },

  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateText: { color: '#333' },
  dateControls: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  smallControl: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8, marginBottom: 8 },

  calendarWrap: { borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  timeListWrap: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  timeRow: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
});