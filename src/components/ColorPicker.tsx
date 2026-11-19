import { labelBgColors } from "@/constants/colors";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
    labelColor: string;
    onValueChange: (value: string) => void;
}

export default function ColorPicker({ labelColor, onValueChange: onChangeColor }: Props) {
    return (
        <View style={styles.grid}>
            {labelBgColors.map((color) => (
                <View key={color} style={styles.cell}>
                    <TouchableOpacity
                        style={[
                            styles.colorCircle,
                            { backgroundColor: color },
                            labelColor === color && styles.selected,
                            labelColor === color && { shadowColor: color },
                        ]}
                        onPress={() => onChangeColor(color)}
                        activeOpacity={0.8}
                    >
                        {labelColor === color && (
                            <MaterialIcons name="check" size={26} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // Wraps into rows of 8 equal columns across the full width, also in landscape
    grid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 4,
    },
    // 1/8 of the width; the fixed-size circle is centred in it
    cell: {
        width: "12.5%",
        alignItems: "center",
        paddingVertical: 4,
    },
    colorCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    selected: {
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 5,
        transform: [{ scale: 1.15 }],
    },
});
