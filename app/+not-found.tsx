import React from 'react';
import { router } from 'expo-router';
import { Button, Empty, Shell } from '../src/ui/components';
export default function NotFound() { return <Shell><Empty title="Pagina non trovata" text="Ripartiamo dal tuo spazio di studio."><Button onPress={() => router.replace('/')}>Torna alla panoramica</Button></Empty></Shell>; }
