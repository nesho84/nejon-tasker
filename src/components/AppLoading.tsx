import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  text?: string;
  inline?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export default function AppLoading({ text, inline = false, style }: Props) {
  // Stores
  const isReady = useThemeStore((state) => state.isReady);
  const theme = useThemeStore((state) => state.theme);
  const tr = useLanguageStore((state) => state.tr);

  if (!isReady) return null;

  const containerStyle = inline
    ? [styles.inlineContainer, { backgroundColor: theme.bg }]
    : [styles.fullContainer, { backgroundColor: theme.bg }];

  return (
    <View style={[...containerStyle, style]} pointerEvents="auto">
      <ActivityIndicator size="large" color={theme.muted} />
      <Text style={[styles.loadingText, { color: theme.text, opacity: 0.7 }]}>
        {text ?? tr.messages.loading}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
  },
  inlineContainer: {
    position: "absolute",
    top: -40,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
});
