import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Item {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface Props {
  items: Item[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  style?: any;
  textColor?: string;
  iconColor?: string;
  backgroundColor?: string;
  modalBackgroundColor?: string;
  borderColor?: string;
  enabled?: boolean;
}

export default function CustomPicker({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select...",
  style,
  textColor = "#666",
  iconColor = "#666",
  backgroundColor = "#fff",
  modalBackgroundColor = "#fff",
  borderColor = "#ddd",
  enabled = true,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value: string | number) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor, borderColor, opacity: enabled ? 1 : 0.5 },
          style
        ]}
        onPress={() => enabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={!enabled}
      >
        {selectedItem ? (
          <>
            {selectedItem.icon && (
              <MaterialCommunityIcons
                name={selectedItem.icon as any}
                size={20}
                color={selectedItem.color || textColor}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[styles.selectedText, { color: selectedItem.color || textColor }]}>
              {selectedItem.label}
            </Text>
          </>
        ) : (
          <Text style={[styles.selectedText, { color: textColor, opacity: 0.5 }]}>
            {placeholder}
          </Text>
        )}
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={iconColor}
          style={styles.chevron}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    {
                      backgroundColor: selectedValue === item.value
                        ? `${iconColor}15`
                        : 'transparent',
                      borderBottomColor: borderColor,
                    }
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  {item.icon && (
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={24}
                      color={item.color || iconColor}
                      style={{ marginRight: 12 }}
                    />
                  )}
                  <Text style={[styles.optionText, { color: item.color || textColor }]}>
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={iconColor}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedText: {
    fontSize: 17,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '60%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 17,
    flex: 1,
    fontWeight: '500',
  },
});