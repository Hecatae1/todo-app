import React from 'react';
import { View, Text,StyleSheet } from 'react-native';
import TodoItem from '../components/todo-item';
import { Stack } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      {/* Change the header title */}
      <Stack.Screen options={{ title: 'TO-DO' }} />

      <TodoItem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' , fontWeight: 700},
  header: {
    height: 72,
    paddingTop: 28,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700' },
});