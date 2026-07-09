import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Item, ListRole } from '../types';
import Icon from './Icon';

type Props = {
  item: Item;
  role: ListRole;
  onToggle: (id: string, isChecked: boolean) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
};

function ItemRow({ item, role, onToggle, onEdit, onDelete }: Props) {
  const canMutate = role === 'owner' || role === 'editor';

  function handleDelete() {
    Alert.alert('Delete item', `Remove "${item.name}" from this list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(item.id),
      },
    ]);
  }

  return (
    <View className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3 mb-2">
      {/* Checkbox */}
      <TouchableOpacity
        testID="checkbox"
        onPress={() => onToggle(item.id, !item.is_checked)}
        className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
          item.is_checked
            ? 'bg-brand-green border-brand-green'
            : 'border-ink-soft/40'
        }`}
      >
        {item.is_checked && <Icon name="check" size={14} color="#2E3527" />}
      </TouchableOpacity>

      {/* Name and quantity */}
      <View className="flex-1">
        <Text
          className={`text-base ${
            item.is_checked ? 'line-through text-ink-soft' : 'text-ink'
          }`}
        >
          {item.name}
        </Text>
        {item.quantity > 1 && (
          <Text className="text-xs text-ink-soft mt-0.5">
            Qty: {item.quantity}
          </Text>
        )}
      </View>

      {/* Actions — only for owner or editor */}
      {canMutate && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="w-8 h-8 rounded-full bg-line items-center justify-center"
            accessibilityLabel="Edit item"
          >
            <Icon name="edit-2" size={14} color="#767C6C" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="w-8 h-8 rounded-full bg-danger/10 items-center justify-center"
            accessibilityLabel="Delete item"
          >
            <Icon name="trash-2" size={14} color="#C1473F" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default React.memo(ItemRow);
