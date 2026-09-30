import { Platform, StyleSheet } from 'react-native';

export const color = {
  bg: '#F8F7F3', paper: '#FFFFFF', ink: '#203D35', muted: '#777E75', line: '#E4E6DC',
  green: '#365C46', soft: '#EBF0E5', lime: '#DDE9AA', warm: '#F2EAD9', amber: '#A57727',
  red: '#A84036', redSoft: '#FCF0EC', blue: '#386282',
};
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
export const ui = StyleSheet.create({
  title: { fontFamily: serif, fontSize: 38, lineHeight: 46, color: color.ink, letterSpacing: -1 },
  h2: { fontFamily: serif, fontSize: 26, lineHeight: 33, color: color.ink, letterSpacing: -0.4 },
  text: { fontSize: 15, lineHeight: 23, color: color.ink },
  muted: { fontSize: 14, lineHeight: 22, color: color.muted },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: color.muted, textTransform: 'uppercase' },
  card: { backgroundColor: color.paper, borderWidth: 1, borderColor: color.line, borderRadius: 20, padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  divider: { height: 1, backgroundColor: color.line, marginVertical: 22 },
});
