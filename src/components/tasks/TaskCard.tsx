import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { StyleSheet, Text, View } from "react-native";
import Hyperlink from 'react-native-hyperlink';

interface Props {
    task: Task;
    leftAction?: React.ReactNode;
    rightActions?: React.ReactNode;
    bottomContent?: React.ReactNode;
}

export default function TaskCard({ task, leftAction, rightActions, bottomContent }: Props) {
    const { theme } = useThemeStore();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: task.checked ? theme.faded : theme.backgroundAlt,
                    borderColor: task.checked ? theme.faded : theme.border,
                },
            ]}
        >
            {/* Top Section */}
            <View style={styles.top}>
                {leftAction && (
                    <View style={styles.leftAction}>
                        {leftAction}
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Hyperlink linkDefault={true} linkStyle={{ color: theme.link }}>
                        <Text
                            style={{
                                color: task.checked ? theme.muted : theme.text,
                                textDecorationLine: task.checked ? "line-through" : "none",
                                fontSize: 15,
                                lineHeight: 22,
                            }}
                        >
                            {task.text}
                        </Text>
                    </Hyperlink>
                </View>

                {rightActions && (
                    <View style={styles.rightActions}>
                        {rightActions}
                    </View>
                )}
            </View>

            {bottomContent && (
                <View style={[styles.bottom, { backgroundColor: theme.shadow }]}>
                    {bottomContent}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        marginHorizontal: 8,
        borderRadius: 5,
        borderWidth: 1,
    },
    top: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    leftAction: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    rightActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
    },
    bottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
});