import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { List, ListRole } from '../types';
import Icon from './Icon';

type Props = {
  list: List;
  role: ListRole;
  onPress: (list: List) => void;
  onEdit?: (list: List) => void;
  onDelete?: (id: string) => void;
};

function ListCard({ list, role, onPress, onEdit, onDelete }: Props) {
  const isOwner = role === 'owner';

  function handleDelete() {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(list.id),
        },
      ],
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(list)}
      className="bg-surface border border-line rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center">
            <Icon name="shopping" size={16} color="#767C6C" family="material" />
            <Text className="text-base font-semibold text-ink ml-2">
              {list.name}
            </Text>
            {!isOwner && (
              <View className="ml-2 bg-brand-clay/15 rounded-full px-2 py-0.5">
                <Text className="text-xs text-brand-clay capitalize">
                  {role}
                </Text>
              </View>
            )}
          </View>
          {list.description ? (
            <Text className="text-sm text-ink-soft mt-1" numberOfLines={2}>
              {list.description}
            </Text>
          ) : null}
          <View className="flex-row items-center mt-2">
            <Icon name="calendar" size={12} color="#767C6C" />
            <Text className="text-xs text-ink-soft ml-1">
              {new Date(list.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isOwner && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onEdit?.(list)}
              className="w-9 h-9 rounded-full bg-line items-center justify-center"
              accessibilityLabel="Edit list"
            >
              <Icon name="edit-2" size={16} color="#767C6C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="w-9 h-9 rounded-full bg-danger/10 items-center justify-center"
              accessibilityLabel="Delete list"
            >
              <Icon name="trash-2" size={16} color="#C1473F" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ListCard);
