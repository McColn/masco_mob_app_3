// Repayment Schedule (Monthly Outstanding) — mirrors monthly_outstanding_report() web view
// Screenshot: S/N | Name | Check no | Employer | Contact |
//   Amount to be paid | Paid amount (This month) | Not paid | Outstanding (Total)
// Sorted by not_paid descending
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useBranchStore } from '@/store/branchStore';
import { ReportService } from '@/lib/services';

const TEAL = '#5bc0de';
const GOLD = '#c8a96e';
const NAVY = '#0d1b2e';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtN(v: any): string {
  const n = Number(v) || 0;
  if (n === 0) return '0';
  return Math.round(n).toLocaleString('en-US');
}

export default function RepaymentScheduleScreen() {
  const today = new Date();
  const [year,  setYear]   = useState(String(today.getFullYear()));
  const [month, setMonth]  = useState(today.getMonth() + 1);
  const [search, setSearch] = useState<string | null>(null);
  const { selectedBranch } = useBranchStore();

  const { data, isLoading } = useQuery({
    queryKey: ['repayment-schedule', search, selectedBranch?.id],
    queryFn: () => ReportService.monthlyOutstanding({ month: search! }),
    enabled: !!search,
  });

  const rows: any[]  = data?.loans ?? data?.rows ?? [];
  const branchName   = data?.branch_name ?? selectedBranch?.name?.toUpperCase() ?? '';
  const monthLabel   = data?.month_label ?? `${MONTHS[month-1].toUpperCase()}/${year}`;

  return (
    <ScreenLayout title="Repayment Schedule" subtitle={selectedBranch?.name} showBack>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Month/Year picker */}
        <View style={s.filterCard}>
          <Text style={s.filterLabel}>Select Month & Year</Text>

          {/* Month chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity key={m}
                  style={[s.monthChip, month === i+1 && s.monthChipActive]}
                  onPress={() => setMonth(i+1)}>
                  <Text style={[s.monthChipText, month === i+1 && s.monthChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Year input */}
          <View style={s.yearRow}>
            <Text style={s.yearLabel}>Year:</Text>
            <TextInput style={s.yearInput} value={year} onChangeText={setYear}
              keyboardType="numeric" maxLength={4} />
          </View>

          <TouchableOpacity style={s.searchBtn}
            onPress={() => {
              const mm = String(month).padStart(2,'0');
              setSearch(`${year}-${mm}-01`);
            }}>
            <Text style={s.searchBtnText}>🔍  View Schedule</Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />}

        {data && (
          <>
            {/* Title — matches screenshot */}
            <Text style={s.branchTitle}>{branchName} BRANCH</Text>
            <Text style={s.reportTitle}>MONTHLY OUTSTANDING UP TO {monthLabel}</Text>

            {rows.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>No outstanding clients for this month.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginHorizontal: Spacing.base }}>
                <View style={s.table}>

                  {/* ── Column headers ── */}
                  <View style={[s.row, s.thead]}>
                    <Text style={[s.cell, s.th, { width: 40,  textAlign: 'center' }]}>S/N</Text>
                    <Text style={[s.cell, s.th, { width: 165 }]}>Name</Text>
                    <Text style={[s.cell, s.th, { width: 90  }]}>Check no</Text>
                    <Text style={[s.cell, s.th, { width: 100 }]}>Employer</Text>
                    <Text style={[s.cell, s.th, { width: 110 }]}>Contact</Text>
                    <Text style={[s.cell, s.th, { width: 120, textAlign: 'right' }]}>Amount to be paid</Text>
                    <Text style={[s.cell, s.th, { width: 130, textAlign: 'right' }]}>Paid amount (This month)</Text>
                    <Text style={[s.cell, s.th, { width: 100, textAlign: 'right' }]}>Not paid</Text>
                    <Text style={[s.cell, s.th, { width: 120, textAlign: 'right' }]}>Outstanding (Total)</Text>
                  </View>

                  {/* ── Data rows ── */}
                  {rows.map((r: any, i: number) => (
                    <View key={i} style={[s.row, i % 2 === 1 && s.rowAlt]}>
                      <Text style={[s.cell, { width: 40,  textAlign: 'center', color: Colors.textMuted }]}>{r.sn ?? i+1}</Text>
                      <Text style={[s.cell, { width: 165, fontWeight: '500' }]} numberOfLines={1}>{r.name}</Text>
                      <Text style={[s.cell, { width: 90,  color: Colors.textMuted }]}>{r.check_no}</Text>
                      <Text style={[s.cell, { width: 100, color: Colors.textMuted }]} numberOfLines={1}>{r.employer}</Text>
                      <Text style={[s.cell, { width: 110, color: Colors.textMuted }]}>{r.contact}</Text>
                      <Text style={[s.cell, { width: 120, textAlign: 'right' }]}>{fmtN(r.amount_to_be_paid)}</Text>
                      <Text style={[s.cell, { width: 130, textAlign: 'right', color: Number(r.paid_this_month) > 0 ? Colors.success : Colors.textMuted }]}>
                        {fmtN(r.paid_this_month)}
                      </Text>
                      <Text style={[s.cell, { width: 100, textAlign: 'right', fontWeight: '700', color: Colors.error }]}>
                        {fmtN(r.not_paid)}
                      </Text>
                      <Text style={[s.cell, { width: 120, textAlign: 'right', color: Colors.error }]}>
                        {fmtN(r.outstanding_total)}
                      </Text>
                    </View>
                  ))}

                  {/* ── Total footer row — matching screenshot "Total" row ── */}
                  <View style={[s.row, s.tfoot]}>
                    <Text style={[s.cell, s.tfootText, { width: 40+165+90+100+110 }]}>Total</Text>
                    <Text style={[s.cell, s.tfootText, { width: 120, textAlign: 'right' }]}>{fmtN(data.total_amount_to_pay)}</Text>
                    <Text style={[s.cell, s.tfootText, { width: 130, textAlign: 'right' }]}>{fmtN(data.total_paid_this_month)}</Text>
                    <Text style={[s.cell, s.tfootText, { width: 100, textAlign: 'right' }]}>{fmtN(data.total_not_paid)}</Text>
                    <Text style={[s.cell, s.tfootText, { width: 120, textAlign: 'right' }]}>{fmtN(data.total_outstanding)}</Text>
                  </View>

                </View>
              </ScrollView>
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const s = StyleSheet.create({
  filterCard: {
    backgroundColor: Colors.surface, margin: Spacing.base,
    borderRadius: Radius.lg, padding: Spacing.base,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  filterLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  monthChip:       { paddingHorizontal: 13, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt },
  monthChipActive: { backgroundColor: NAVY, borderColor: NAVY },
  monthChipText:       { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  monthChipTextActive: { color: '#fff', fontWeight: '700' },
  yearRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  yearLabel: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  yearInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 7, fontSize: Typography.sizes.base, color: Colors.text, width: 90 },
  searchBtn:     { backgroundColor: NAVY, borderRadius: Radius.md, paddingVertical: 11, alignItems: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  branchTitle:  { textAlign: 'center', fontSize: 13, fontWeight: '700', color: NAVY, marginTop: Spacing.sm, textDecorationLine: 'underline' },
  reportTitle:  { textAlign: 'center', fontSize: 12, fontWeight: '800', color: NAVY, textDecorationLine: 'underline', marginBottom: Spacing.sm, letterSpacing: 0.3 },

  table:    { borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowAlt:   { backgroundColor: '#f0f8fa' },
  thead:    { backgroundColor: TEAL, borderBottomWidth: 2, borderBottomColor: '#4aa8c4' },
  tfoot:    { backgroundColor: GOLD, borderBottomWidth: 0 },
  cell:     { fontSize: 11, color: Colors.text, paddingHorizontal: 4 },
  th:       { color: '#fff', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.2 },
  tfootText:{ color: '#1a1a1a', fontWeight: '800', fontSize: 11 },

  emptyBox:  { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
});
