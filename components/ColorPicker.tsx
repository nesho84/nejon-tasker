import { labelBgColors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, } from "react-native";

interface Props {
    labelColor: string,
    onValueChange: (value: string) => void;
}

export default function ColorPicker({ labelColor, onValueChange: onChangeColor }: Props) {
    return (
        <View style={[styles.container, { borderColor: labelColor }]}>
            {labelBgColors.map((color) => {
                return (
                    <TouchableOpacity
                        key={color}
                        style={[styles.selectedColor, { backgroundColor: color }]}
                        onPress={() => {
                            console.log(color);
                            onChangeColor(color);
                        }}
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
        borderWidth: 2,
        borderRadius: 5,
        padding: 5,
    },
    selectedColor: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 35,
        height: 35,
        borderRadius: 4,
        margin: 3,
    },
});
