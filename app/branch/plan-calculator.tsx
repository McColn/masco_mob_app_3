import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { Colors, Spacing, Typography, Radius, Shadow } from '@/constants/theme';

// Matching the web "Customer Plan Calculator" screenshot exactly:
// Input:  Planned Monthly Repayment, Interest per annum (%), Period (Months)
// Output: Loan Amount, Interest Amount, Total Return Amount
// 
// Formula (derived from web):
//   total_return  = monthly_repayment × period
//   interest_rate = (annual_rate / 100) / 12   (monthly rate)
//   loan_amount   = total_return / (1 + interest_rate × period)
//   interest      = total_return - loan_amount

function fmt(n: number): string {
  if (!n || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

export default function PlanCalculatorScreen() {
  const [monthlyRepayment, setMonthlyRepayment] = useState('');
  const [annualRate,       setAnnualRate]       = useState(5);
  const [period,           setPeriod]           = useState('3');

  // Live calculation — updates as user types
  const repayment    = Number(monthlyRepayment.replace(/,/g, '')) || 0;
  const monthlyRate  = annualRate / 100 / 12;
  const periodNum    = Number(period) || 0;
  const totalReturn  = repayment * periodNum;
  const loanAmount   = monthlyRate > 0
    ? totalReturn / (1 + monthlyRate * periodNum)
    : totalReturn;
  const interestAmt  = totalReturn - loanAmount;

  const hasResult = repayment > 0 && periodNum > 0;

  return (
    <ScreenLayout title="Plan Calculator" showBack>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Input card (white, matches top half of screenshot) ── */}
          <View style={styles.inputCard}>
            <Text style={styles.cardTitle}>Customer Plan Calculator</Text>
            <View style={styles.divider} />

            {/* Planned Monthly Repayment */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Planned Monthly Repayment</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={monthlyRepayment}
                  onChangeText={setMonthlyRepayment}
                  keyboardType="numeric"
                  placeholder="100,000"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.inputSuffix}>/=</Text>
              </View>
            </View>

            {/* Interest per annum */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Interest per annum (%)</Text>
              <View style={styles.spinnerWrapper}>
                <TouchableOpacity
                  style={styles.spinBtn}
                  onPress={() => setAnnualRate(r => Math.max(1, r - 1))}
                >
                  <Text style={styles.spinBtnText}>▼</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.spinInput}
                  value={String(annualRate)}
                  onChangeText={v => {
                    const n = Number(v);
                    if (!isNaN(n) && n >= 0 && n <= 100) setAnnualRate(n);
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.spinBtn}
                  onPress={() => setAnnualRate(r => Math.min(100, r + 1))}
                >
                  <Text style={styles.spinBtnText}>▲</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Period (Months) — free text input, any number */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Period (Months)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={period}
                  onChangeText={setPeriod}
                  keyboardType="numeric"
                  placeholder="e.g. 12"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* ── Results card (sage/grey-green, matches bottom half of screenshot) ── */}
          {hasResult && (
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Loan Amount :</Text>
                <Text style={styles.resultValue}>{fmt(loanAmount)} /=</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Interest Amount:</Text>
                <Text style={styles.resultValue}>{fmt(interestAmt)} /=</Text>
              </View>
              <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.resultLabel}>Total return Amount:</Text>
                <Text style={styles.resultValue}>{fmt(totalReturn)} /=</Text>
              </View>
            </View>
          )}

          {/* Helper note */}
          <Text style={styles.hint}>
            Formula: Loan = (Monthly × Period) ÷ (1 + Rate% × Period)
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const SAGE = '#c8d5c8';

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },

  // Input card — white, clean
  inputCard: {
    backgroundColor: '#fff',
    margin: Spacing.base,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  cardTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.base },

  // Field rows — label left, input right (matches screenshot layout)
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  fieldLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  // Monthly repayment input with /= suffix
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 170,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  inputSuffix: {
    paddingHorizontal: 8,
    color: Colors.textMuted,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    fontSize: Typography.sizes.sm,
    paddingVertical: 11,
  },

  // Spinner for interest rate
  spinnerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  spinBtn: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surfaceAlt,
  },
  spinBtnText: { fontSize: 10, color: Colors.textSecondary },
  spinInput: {
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 9,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    backgroundColor: '#fff',
  },

  // Period chips (replaces dropdown)
  periodScroll: { maxWidth: 200 },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 6,
  },
  periodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  periodChipTextActive: {
    color: '#fff',
    fontWeight: Typography.weights.semibold,
  },

  // Result card — sage/grey-green background matching screenshot
  resultCard: {
    backgroundColor: SAGE,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    ...Shadow.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  resultLabel: {
    fontSize: Typography.sizes.sm,
    color: '#4a5a4a',
  },
  resultValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: '#2c3c2c',
    textDecorationLine: 'underline',
  },

  hint: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
  },
});
