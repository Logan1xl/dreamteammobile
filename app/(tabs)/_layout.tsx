/**
 * ============================================================
 * Layout des Onglets - Dream Team Mobile
 * Navigation par onglets avec icônes Ionicons harmonisées
 * ============================================================
 */
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../../src/theme/theme';

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
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Onglet Accueil / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={focused ? COLORS.primary : color} />
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
              <Ionicons name={focused ? "repeat" : "repeat-outline"} size={22} color={focused ? COLORS.primary : color} />
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
              <Ionicons name={focused ? "card" : "card-outline"} size={22} color={focused ? COLORS.primary : color} />
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
              <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={focused ? COLORS.primary : color} />
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
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={focused ? COLORS.primary : color} />
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
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    ...SHADOWS.heavy,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabItem: {
    paddingTop: 4,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryAlpha(0.05),
  },
});
