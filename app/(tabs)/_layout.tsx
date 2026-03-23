/**
 * ============================================================
 * Layout des Onglets - Dream Team Mobile
 * Navigation par onglets avec icônes animées et dégradé
 * ============================================================
 */
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import {
  Home,
  Repeat,
  CreditCard,
  PiggyBank,
  UserCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, FONT_SIZE, FONT_WEIGHT } from '../../src/theme/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* Onglet Accueil / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Home size={22} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Onglet Tontines */}
      <Tabs.Screen
        name="tontines"
        options={{
          title: 'Tontines',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Repeat size={22} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Onglet Paiements */}
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Paiements',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <CreditCard size={22} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Onglet Épargne */}
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Épargne',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <PiggyBank size={22} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* Onglet Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <UserCircle size={22} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    ...SHADOWS.medium,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    padding: 6,
  },
});
