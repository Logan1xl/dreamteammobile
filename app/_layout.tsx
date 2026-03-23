/**
 * ============================================================
 * Layout Principal - Dream Team Mobile (Expo Router)
 * Gère la navigation racine et les guards d'authentification
 * ============================================================
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { COLORS } from '../src/theme/theme';

// Empêcher le splash screen natif de se masquer automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Masquer le splash screen natif dès que le layout est prêt
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Barre de statut claire sur fond sombre */}
      <StatusBar style="light" />

      {/* Navigation Stack principale */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Splash screen - pas de header */}
        <Stack.Screen name="index" options={{ animation: 'fade' }} />

        {/* Écrans d'authentification */}
        <Stack.Screen
          name="login"
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="register"
          options={{ animation: 'slide_from_right' }}
        />

        {/* Navigation par onglets (authentifié) */}
        <Stack.Screen
          name="(tabs)"
          options={{ animation: 'fade' }}
        />

        {/* Écrans modaux et détails */}
        <Stack.Screen
          name="tontine/[id]"
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="payment/create"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="sanctions/index"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="requests/index"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="requests/create"
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
