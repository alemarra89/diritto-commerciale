import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StudyProvider, useStudy } from '../src/lib/store';
import { Loading } from '../src/ui/components';
import { color } from '../src/ui/theme';

function Routes() {
  const { ready } = useStudy();
  if (!ready) return <Loading />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: 'fade' }} />;
}
export default function RootLayout() {
  return <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: color.bg }}><StatusBar style="dark" /><StudyProvider><Routes /></StudyProvider></SafeAreaView></SafeAreaProvider>;
}
