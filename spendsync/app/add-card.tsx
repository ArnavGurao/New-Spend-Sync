import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { getGradientColors } from '../constants/gradients';
import { db } from '../db/client';
import * as schema from '../db/schema';
import { COLORS } from '../constants/theme';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getBankLogoUri } from '../constants/logoMap';
import type { Network } from '../store/useStore';

const BANK_OPTIONS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Yes Bank',
  'IndusInd Bank',
];

const NETWORKS: Network[] = ['Visa', 'Mastercard', 'RuPay'];

export default function AddCardScreen(): React.JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCard, showToast } = useStore();

  const [bank, setBank] = useState('HDFC Bank');
  const [variant, setVariant] = useState('');
  const [last4, setLast4] = useState('');
  const [expiry, setExpiry] = useState('');
  const [network, setNetwork] = useState<Network>('Visa');
  const [bankPickerVisible, setBankPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const gradientColors = getGradientColors(bank) as [string, string, ...string[]];

  const handleExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setExpiry(digits);
    } else {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`);
    }
  };

  const handleLast4 = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setLast4(digits);
  };

  const handleSave = useCallback(async () => {
    if (!variant.trim()) {
      Alert.alert('Card variant required', 'e.g. HDFC INFINIA');
      return;
    }
    if (last4.length !== 4) {
      Alert.alert('Last 4 digits required');
      return;
    }
    if (expiry.length < 5) {
      Alert.alert('Valid expiry required', 'Format: MM/YY');
      return;
    }

    setSaving(true);
    try {
      const newCard = {
        id: `card_${Date.now()}`,
        bank,
        variant: variant.trim().toUpperCase(),
        last4,
        expiry,
        network,
        gradient: getGradientColors(bank),
        monthlySpend: 0,
      };

      await db.insert(schema.cards).values({
        id: newCard.id,
        bank: newCard.bank,
        variant: newCard.variant,
        last4: newCard.last4,
        expiry: newCard.expiry,
        network: newCard.network,
        gradient: JSON.stringify(newCard.gradient),
        monthlySpend: 0,
        createdAt: Date.now(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addCard(newCard);
      showToast(`+ ${newCard.variant} added!`, 'success');
      router.back();
    } catch {
      showToast('Failed to save card. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [bank, variant, last4, expiry, network, addCard, showToast, router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>x</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewBank}>{bank}</Text>
              <Text style={styles.previewVariant}>{variant || 'CARD VARIANT'}</Text>
            </View>
            <View style={styles.networkBadge}>
              <Text style={styles.networkBadgeText}>{network.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.previewChip} />
          <Text style={styles.previewNumber}>**** **** **** {last4 || '____'}</Text>
          <Text style={styles.previewExpiry}>Expires {expiry || 'MM/YY'}</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Card Details</Text>

        <Pressable style={styles.field} onPress={() => setBankPickerVisible(true)}>
          <Text style={styles.fieldLabel}>Bank</Text>
          <View style={styles.fieldValueWrap}>
            <BrandLogo label={bank} uri={getBankLogoUri(bank)} size={30} rounded={10} />
            <Text style={styles.fieldValue}>{bank} ›</Text>
          </View>
        </Pressable>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Card Variant</Text>
          <TextInput
            style={styles.input}
            value={variant}
            onChangeText={setVariant}
            placeholder="e.g. HDFC INFINIA"
            placeholderTextColor={COLORS.outlineVariant}
            keyboardAppearance="dark"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Last 4 Digits</Text>
            <TextInput
              style={styles.input}
              value={last4}
              onChangeText={handleLast4}
              placeholder="4521"
              placeholderTextColor={COLORS.outlineVariant}
              keyboardType="numeric"
              maxLength={4}
              keyboardAppearance="dark"
            />
          </View>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={handleExpiry}
              placeholder="08/27"
              placeholderTextColor={COLORS.outlineVariant}
              keyboardType="numeric"
              maxLength={5}
              keyboardAppearance="dark"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.networkRow}>
          {NETWORKS.map((item) => (
            <Pressable
              key={item}
              style={[styles.networkPill, network === item && styles.networkPillActive]}
              onPress={() => setNetwork(item)}
            >
              <Text style={[styles.networkText, network === item && styles.networkTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Add Card</Text>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal transparent visible={bankPickerVisible} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <Pressable onPress={() => setBankPickerVisible(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </Pressable>
            </View>

            {BANK_OPTIONS.map((item) => (
              <Pressable
                key={item}
                style={styles.bankRow}
                onPress={() => {
                  setBank(item);
                  setBankPickerVisible(false);
                }}
              >
                <BrandLogo label={item} uri={getBankLogoUri(item)} size={34} rounded={10} />
                <Text style={[styles.bankRowText, bank === item && styles.bankRowActive]}>
                  {item}
                </Text>
                {bank === item && <Text style={styles.bankCheck}>+</Text>}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252626',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#e7e5e4', fontSize: 18, fontWeight: '700', textTransform: 'uppercase' },
  headerTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '700' },
  content: { padding: 24, gap: 16 },

  cardPreview: {
    borderRadius: 20,
    padding: 22,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  previewBank: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  previewVariant: { color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  networkBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  networkBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  previewChip: { width: 32, height: 24, backgroundColor: 'rgba(255,215,0,0.5)', borderRadius: 4 },
  previewNumber: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600', letterSpacing: 2 },
  previewExpiry: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },

  sectionTitle: { color: '#acabaa', fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },

  field: {
    backgroundColor: '#1f2020',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#484848',
    gap: 12,
  },
  fieldLabel: { color: '#acabaa', fontSize: 14 },
  fieldValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldValue: { color: '#e7e5e4', fontSize: 14, fontWeight: '600' },

  inputWrapper: { gap: 6 },
  inputLabel: { color: '#acabaa', fontSize: 11, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1f2020',
    borderRadius: 12,
    padding: 14,
    color: '#e7e5e4',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#484848',
  },

  row: { flexDirection: 'row', gap: 12 },

  networkRow: { flexDirection: 'row', gap: 10 },
  networkPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: '#252626',
  },
  networkPillActive: { backgroundColor: '#454747', borderColor: '#767575' },
  networkText: { color: '#767575', fontSize: 13, fontWeight: '600' },
  networkTextActive: { color: '#e7e5e4' },

  saveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: COLORS.onSecondary, fontSize: 16, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#191a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#e7e5e4', fontSize: 16, fontWeight: '700' },
  modalClose: { color: '#ffbf00', fontSize: 15, fontWeight: '600' },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252626',
  },
  bankRowText: { color: '#acabaa', fontSize: 15, flex: 1 },
  bankRowActive: { color: '#e7e5e4', fontWeight: '600' },
  bankCheck: { color: '#ffbf00', fontSize: 16, fontWeight: '700' },
});
