import { Tabs } from 'expo-router'

const colors = {
  green: '#1DAB61',
  soft: '#61756C',
  white: '#FFFFFF',
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.soft,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: 'rgba(11,92,59,0.14)',
          borderTopWidth: 0.5,
          height: 49,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="conversations"
        options={{ title: 'Conversations', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="contacts"
        options={{ title: 'Contacts', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="me"
        options={{ title: 'Moi', tabBarIcon: () => null }}
      />
    </Tabs>
  )
}
