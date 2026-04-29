import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Stats() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>統計</Text>
      <Text style={styles.body}>準備中です。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F2F2F2',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  body: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
