import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@kalam/theme';

const SCAN_SIZE = 240;

function Corner({ top, left, bottom, right }: { top?: number; left?: number; bottom?: number; right?: number }) {
  return (
    <>
      <View style={[styles.cornerH, { top, left, bottom, right }]} />
      <View style={[styles.cornerV, { top, left, bottom, right }]} />
    </>
  );
}

export default function QrScannerScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Camera background placeholder */}
      <View style={styles.cameraBg} />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      {/* Scan square */}
      <View style={styles.scanArea}>
        <View style={styles.scanSquare} />
        <Corner top={0} left={0} />
        <Corner top={0} right={0} />
        <Corner bottom={0} left={0} />
        <Corner bottom={0} right={0} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionWrap}>
        <Text style={styles.instructionText}>
          Scannez le QR affiché sur votre nouvel appareil
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  cameraBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#222' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
  scanArea: { position: 'absolute', top: '50%', left: '50%', width: SCAN_SIZE, height: SCAN_SIZE, marginLeft: -SCAN_SIZE / 2, marginTop: -SCAN_SIZE / 2, zIndex: 2 },
  scanSquare: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 },
  cornerH: { position: 'absolute', width: 40, height: 4, backgroundColor: '#fff', borderRadius: 2 },
  cornerV: { position: 'absolute', width: 4, height: 40, backgroundColor: '#fff', borderRadius: 2 },
  instructionWrap: { position: 'absolute', top: '50%', left: 0, right: 0, marginTop: SCAN_SIZE / 2 + 24, paddingHorizontal: 20, zIndex: 3 },
  instructionText: { fontSize: 14, color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
});
