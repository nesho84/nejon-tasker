import ModalSheet from "@/components/ModalSheet";
import { globalStyles } from "@/constants/styles";
import DebugPanel from "@/debug/DebugPanel";
import { useThemeStore } from "@/store/themeStore";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { ComponentRef, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Last scroll position: the sheet reopens where it was left (until the app restarts)
let lastScrollY = 0;

export default function DebugTools() {
  // Stores
  const theme = useThemeStore((state) => state.theme);

  // Refs
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const restored = useRef(false);

  // ------------------------------------------------------------
  // Restore the last scroll position once the list has its full height
  // ------------------------------------------------------------
  const restoreScroll = () => {
    if (restored.current) {
      return;
    }
    restored.current = true;
    scrollRef.current?.scrollTo({ y: lastScrollY, animated: false });
  };

  // ------------------------------------------------------------
  // Remember the scroll position
  // ------------------------------------------------------------
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastScrollY = e.nativeEvent.contentOffset.y;
  };

  // Main Content
  return (
    <ModalSheet
      size="xxl"
      scrolling={false}
      colors={{ sheetBackgroundColor: theme.bg2, handleColor: theme.handle, headerBarBorderColor: 'transparent' }}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={100}
        onScroll={handleScroll}
        onContentSizeChange={restoreScroll}
      >
        <View style={globalStyles.modalContainer}>

          {/* Title row */}
          <View style={globalStyles.modalTitleRow}>
            <Text style={[globalStyles.modalTitle, { color: theme.danger }]}>Debug tools</Text>
            <MaterialDesignIcons name="wrench" size={20} color={theme.danger} />
          </View>

          {/* Divider below title */}
          <View style={[globalStyles.modalDivider, { backgroundColor: theme.divider }]} />

          <DebugPanel />
        </View>
      </ScrollView>
    </ModalSheet>
  );
}
