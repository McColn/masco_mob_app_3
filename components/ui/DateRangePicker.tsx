// Reusable date range picker for report screens
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';

interface Props {
  dateFrom: string;
  dateTo: string;
  onChangeDateFrom: (v: string) => void;
  onChangeDateTo: (v: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export function DateRangePicker({ dateFrom, dateTo, onChangeDateFrom, onChangeDateTo, onSearch, loading }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            value={dateFrom}
            onChangeText={onChangeDateFrom}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            value={dateTo}
            onChangeText={onChangeDateTo}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, loading && styles.btnLoading]}
        onPress={onSearch}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Loading...' : '🔍  Generate Report'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, padding: Spacing.base, margin: Spacing.base, borderRadius: Radius.lg, ...Shadow.sm },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  field: { flex: 1 },
  label: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 9,
    fontSize: Typography.sizes.sm, color: Colors.text, backgroundColor: Colors.surfaceAlt,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center',
  },
  btnLoading: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.sm },
});
