import AppFullScreen from '@/components/AppFullScreen';
import { useLabels } from '@/hooks/useLabels';
import { useThemeStore } from '@/store/themeStore';
import { Button, Text, View } from 'react-native';

export default function TestSQLite() {
    const { theme } = useThemeStore();
    const { labels, createLabel } = useLabels();

    return (
        <AppFullScreen>
            <View style={{ padding: 20 }}>
                <Text style={{ color: theme.text }}>SQLite Test - Labels: {labels.length}</Text>
                <Button
                    title="Add Test Label"
                    onPress={() => createLabel({ title: 'Test3', color: '#FF5733' })}
                />
                <View style={{ marginTop: 20 }}>
                    {labels.map(label => (
                        <Text key={label.id} style={{ color: theme.text }}>
                            {label.title}
                        </Text>
                    ))}
                </View>
            </View>
        </AppFullScreen>
    );
}