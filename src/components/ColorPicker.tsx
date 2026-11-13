import { labelBgColors } from "@/constants/colors";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
    labelColor: string;
    onValueChange: (value: string) => void;
}

export default function ColorPicker({ labelColor, onValueChange: onChangeColor }: Props) {
    // Render single color item template
    const RenderColor = ({ item: color }: { item: string }) => {
        return (
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
        );
    };

    return (
        <FlatList
            data={labelBgColors}
            renderItem={RenderColor}
            keyExtractor={(item) => item}
            numColumns={8}
            scrollEnabled={false}
            style={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    // Caps circle size in landscape/tablet
    list: {
        width: "100%",
        maxWidth: 420,
    },
    colorCircle: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 100,
        margin: 4,
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
