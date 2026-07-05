import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent'
        },
      }}
    >
      {/* Labels */}
      <Stack.Screen name="addLabel" />
      <Stack.Screen name="editLabel" />
      {/* Tasks */}
      <Stack.Screen name="editTask" />
    </Stack>
  );
}
