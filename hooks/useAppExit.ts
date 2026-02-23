import { useLanguageStore } from "@/store/languageStore";
import { Alert, BackHandler } from "react-native";

export default function useAppExit() {
  // Stores
  const tr = useLanguageStore((state) => state.tr);

  const backAction = () => {
    Alert.alert(
      tr.alerts.appExit.title,
      tr.alerts.appExit.message,
      [
        {
          text: tr.buttons.cancel,
          onPress: () => null,
          style: "cancel",
        },
        {
          text: tr.buttons.yes,
          onPress: () => BackHandler.exitApp(),
        },
      ]
    );
    return true;
  };

  return { backAction };
}
