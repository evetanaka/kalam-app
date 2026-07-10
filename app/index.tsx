import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

/**
 * Kalam — Welcome / Onboarding screen.
 * First screen users see before creating an account.
 */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBubble}>
            <Text style={styles.logoLock}>🔒</Text>
          </View>
          <Text style={styles.logoText}>kalam</Text>
        </View>

        <Text style={styles.title}>
          Vos messages n'existent que sur vos téléphones.
        </Text>
        <Text style={styles.subtitle}>
          Messagerie chiffrée de bout en bout.{'\n'}
          Sans serveur. Sans numéro. Sans publicité.
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttons}>
          <View style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </View>
          <View style={styles.btnOutline}>
            <Text style={styles.btnOutlineText}>J'ai déjà un compte</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Open source · Chiffré de bout en bout
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBubble: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(29,171,97,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(29,171,97,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoLock: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 34,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textDimmed,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(29,171,97,0.3)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    color: colors.textDimmed,
    letterSpacing: 0.5,
  },
});
