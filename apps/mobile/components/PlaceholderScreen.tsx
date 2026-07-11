import { View, Text, StyleSheet } from 'react-native'

interface PlaceholderScreenProps {
  id: string
  title: string
}

/**
 * Placeholder screen displaying the screen ID and title centered.
 * Uses @kalam/theme tokens (hardcoded here until the theme package is ready).
 */
export function PlaceholderScreen({ id, title }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.id}>{id}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const colors = {
  deep: '#0B5C3B',
  bg: '#F6FAF7',
  soft: '#61756C',
  ink: '#2E3D37',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  id: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.soft,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.deep,
    textAlign: 'center',
  },
})
