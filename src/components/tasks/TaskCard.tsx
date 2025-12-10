import { useThemeStore } from "@/store/themeStore";
import { Task } from "@/types/task.types";
import { StyleSheet, Text, View } from "react-native";
import Hyperlink from 'react-native-hyperlink';

interface Props {
    task: Task;
    topLeftContent?: React.ReactNode;
    topRightContent?: React.ReactNode;
    bottomContent?: React.ReactNode;
}

export default function TaskCard({ task, topLeftContent, topRightContent, bottomContent }: Props) {
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
                {topLeftContent && (
                    <View style={styles.leftAction}>
                        {topLeftContent}
                    </View>
                )}

                <View style={styles.taskText}>
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

                {topRightContent && (
                    <View style={styles.topRight}>
                        {topRightContent}
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
        paddingVertical: 6,
        paddingHorizontal: 8,
        gap: 8,
    },
    leftAction: {
        alignSelf: "flex-start",
        marginTop: 3,
        marginLeft: 2,
        flexShrink: 0,
    },
    taskText: {
        width: "100%",
        marginLeft: 2,
        flexShrink: 1,
    },
    topRight: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 0,
        gap: 12,
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