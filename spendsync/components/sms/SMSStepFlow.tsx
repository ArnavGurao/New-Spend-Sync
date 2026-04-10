// ── FILE: components/sms/SMSStepFlow.tsx ─────────────────────────────────────
// Step content for the SMS bottom sheet — Step 1 and Step 2a/2b.

import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Platform } from 'react-native';
import { useStore } from '../../store/useStore';
import { fmt } from '../../lib/formatters';
import { COLORS } from '../../constants/theme';
import type { BillingCycle, BillingType } from '../../store/useStore';
import type { ParsedSMS } from '../../lib/smsSync';

interface SMSStepFlowProps {
  sms: ParsedSMS;
  onComplete: () => void;
}

export function SMSStepFlow({ sms, onComplete }: SMSStepFlowProps): React.JSX.Element {
  const { smsFlow, setSMSFlow } = useStore();

  if (smsFlow.step === 1) {
    return <Step1 sms={sms} onNext={() => setSMSFlow({ step: 2 })} />;
  }

  if (smsFlow.billingType === 'recurring') {
    return <Step2Recurring sms={sms} onBack={() => setSMSFlow({ step: 1 })} onComplete={onComplete} />;
  }

  return <Step2Trial sms={sms} onBack={() => setSMSFlow({ step: 1 })} onComplete={onComplete} />;
}

// ── STEP 1 ────────────────────────────────────────────────────────────────────
function Step1({ sms, onNext }: { sms: ParsedSMS; onNext: () => void }): React.JSX.Element {
  const { smsFlow, setSMSFlow } = useStore();
  const { billingType } = smsFlow;

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SPENDSYNC DETECTED A CHARGE</Text>

      {/* Raw SMS box */}
      <View style={styles.rawBox}>
        <Text style={styles.rawSMS}>{sms.raw}</Text>
      </View>

      {/* Parsed fields grid */}
      <View style={styles.fieldsGrid}>
        <ParsedField label="Merchant"  value={sms.merchant}              />
        <ParsedField label="Amount"    value={fmt(sms.amount)}           />
        <ParsedField label="Card"      value={`•••• ${sms.cardLastFour}`} />
        <ParsedField label="Date"      value={sms.date}                  />
      </View>

      {/* Type selector */}
      <Text style={styles.sectionLabel}>What type of charge is this?</Text>
      <View style={styles.typeRow}>
        <TypeCard
          icon="🔁"
          title="Recurring Subscription"
          subtitle="Bills automatically every month/year"
          selected={billingType === 'recurring'}
          onPress={() => setSMSFlow({ billingType: 'recurring' })}
        />
        <TypeCard
          icon="⏱"
          title="Free Trial"
          subtitle="Trial that converts to paid"
          selected={billingType === 'trial'}
          onPress={() => setSMSFlow({ billingType: 'trial' })}
        />
      </View>

      {billingType !== null && (
        <Pressable style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── STEP 2A — RECURRING ───────────────────────────────────────────────────────
function Step2Recurring({
  sms,
  onBack,
  onComplete,
}: {
  sms: ParsedSMS;
  onBack: () => void;
  onComplete: () => void;
}): React.JSX.Element {
  const { smsFlow, setSMSFlow } = useStore();
  const { cycle } = smsFlow;

  const CYCLES: { value: BillingCycle; label: string; sublabel: string }[] = [
    { value: 'monthly',   label: 'Monthly',   sublabel: `${fmt(sms.amount)}/month` },
    { value: 'quarterly', label: 'Quarterly', sublabel: `${fmt(sms.amount * 3)}/quarter` },
    { value: 'yearly',    label: 'Yearly',    sublabel: `${fmt(sms.amount * 12)}/year` },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </Pressable>
        <StepDots active={1} />
      </View>

      <Text style={styles.eyebrow}>HOW OFTEN DOES THIS CHARGE?</Text>
      <Text style={styles.merchantName}>{sms.merchant}</Text>

      <View style={styles.cycleList}>
        {CYCLES.map((c) => (
          <Pressable
            key={c.value}
            style={[styles.cyclePill, cycle === c.value && styles.cyclePillActive]}
            onPress={() => setSMSFlow({ cycle: c.value })}
          >
            <Text style={[styles.cycleLabel, cycle === c.value && styles.cycleLabelActive]}>
              {c.label}
            </Text>
            <Text style={[styles.cycleSub, cycle === c.value && styles.cycleSubActive]}>
              {c.sublabel}
            </Text>
          </Pressable>
        ))}
      </View>

      {cycle !== null && (
        <Pressable style={styles.doneButton} onPress={onComplete}>
          <Text style={styles.doneButtonText}>Done — Track This Subscription</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── STEP 2B — TRIAL ───────────────────────────────────────────────────────────
function Step2Trial({
  sms,
  onBack,
  onComplete,
}: {
  sms: ParsedSMS;
  onBack: () => void;
  onComplete: () => void;
}): React.JSX.Element {
  const { smsFlow, setSMSFlow } = useStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </Pressable>
        <StepDots active={1} />
      </View>

      <Text style={styles.eyebrow}>WHEN DOES THE TRIAL END?</Text>
      <Text style={styles.merchantName}>{sms.merchant}</Text>

      <TextInput
        style={styles.dateInput}
        placeholder="DD-Mon-YYYY  e.g. 28-May-2026"
        placeholderTextColor={COLORS.outlineVariant}
        value={smsFlow.trialEndDate ?? ''}
        onChangeText={(v) => setSMSFlow({ trialEndDate: v })}
        keyboardAppearance="dark"
      />

      {/* Warning banner */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          SpendSync will alert you 3 days before your trial ends so you never get charged unexpectedly.
        </Text>
      </View>

      {smsFlow.trialEndDate && smsFlow.trialEndDate.length > 0 && (
        <Pressable style={styles.doneButton} onPress={onComplete}>
          <Text style={styles.doneButtonText}>Done — Track Trial</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function ParsedField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldIcon}>✓</Text>
      <View>
        <Text style={styles.fieldLabel}>Auto-detected · {label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function TypeCard({
  icon, title, subtitle, selected, onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      style={[styles.typeCard, selected && styles.typeCardActive]}
      onPress={onPress}
    >
      <Text style={styles.typeIcon}>{icon}</Text>
      <Text style={[styles.typeTitle, selected && styles.typeTitleActive]}>{title}</Text>
      <Text style={styles.typeSub}>{subtitle}</Text>
    </Pressable>
  );
}

function StepDots({ active }: { active: number }): React.JSX.Element {
  return (
    <View style={styles.dots}>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  eyebrow: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  rawBox: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    padding: 12,
  },
  rawSMS: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  fieldsGrid: { gap: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
  },
  fieldIcon: { color: COLORS.brandTeal, fontSize: 14, fontWeight: '700' },
  fieldLabel: { color: COLORS.onSurfaceVariant, fontSize: 10, letterSpacing: 0.5 },
  fieldValue: { color: COLORS.onSurface, fontSize: 14, fontWeight: '600', marginTop: 1 },
  sectionLabel: { color: COLORS.onSurfaceVariant, fontSize: 12, fontWeight: '500' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(198,198,199,0.08)',
  },
  typeIcon: { fontSize: 22 },
  typeTitle: { color: COLORS.onSurface, fontSize: 13, fontWeight: '600' },
  typeTitleActive: { color: COLORS.primary },
  typeSub: { color: COLORS.onSurfaceVariant, fontSize: 11 },
  nextButton: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: { color: COLORS.onSurface, fontSize: 15, fontWeight: '700' },

  // Step 2
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { padding: 4 },
  backBtnText: { color: COLORS.onSurfaceVariant, fontSize: 14 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.outlineVariant },
  dotActive: { backgroundColor: COLORS.primary, width: 18 },
  merchantName: { color: COLORS.onSurface, fontSize: 22, fontWeight: '700' },
  cycleList: { gap: 10 },
  cyclePill: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cyclePillActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(198,198,199,0.08)',
  },
  cycleLabel: { color: COLORS.onSurface, fontSize: 15, fontWeight: '600' },
  cycleLabelActive: { color: COLORS.primary },
  cycleSub: { color: COLORS.onSurfaceVariant, fontSize: 13 },
  cycleSubActive: { color: COLORS.primary },
  doneButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: { color: COLORS.onSecondary, fontSize: 15, fontWeight: '700' },

  // Trial step
  dateInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.onSurface,
    fontSize: 15,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,191,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,191,0,0.3)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  warningIcon: { fontSize: 16 },
  warningText: { color: COLORS.onSurfaceVariant, fontSize: 12, flex: 1, lineHeight: 18 },
});
