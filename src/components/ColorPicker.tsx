import { LIGHT, labelBgColors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, } from "react-native";

interface Props {
    labelColor: string,
    handleLabelColor: (value: string) => void;
}

export default function ColorPicker({ labelColor, handleLabelColor }: Props) {
    return (
        <View style={styles.container}>
            {labelBgColors.map((color) => {
                return (
                    <TouchableOpacity
                        key={color}
                        style={[styles.selectedColor, { backgroundColor: color }]}
                        onPress={() => handleLabelColor(color)}
                    >
                        {labelColor === color && (
                            <MaterialIcons name="check" size={30} color="white" />
                        )}
                    </TouchableOpacity>
                )
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginVertical: 12,
        borderColor: LIGHT.lightMuted,
        borderWidth: 2,
        borderRadius: 5,
        padding: 2,
    },
    selectedColor: {
        width: 30,
        height: 30,
        borderRadius: 5,
        margin: 2,
    },
});
