import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useItems } from '../hooks/useItems';
import { useListRole } from '../hooks/useListRole';
import ItemRow from '../components/ItemRow';
import ItemModal from '../components/ItemModal';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { Item } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ListDetail'>;

export default function ListDetailScreen({ route, navigation }: Props) {
  const { listId, listName, ownerId } = route.params;
  const {
    items,
    loading,
    error,
    clearError,
    refresh,
    addItem,
    editItem,
    checkItem,
    removeItem,
  } = useItems(listId);

  const { role, loading: roleLoading } = useListRole(listId, ownerId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canMutateItems = role === 'owner' || role === 'editor';
  const isOwner = role === 'owner';

  function handleEdit(item: Item) {
    setEditingItem(item);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setEditingItem(null);
  }

  async function handleSubmit(name: string, quantity: number) {
    try {
      setSubmitting(true);
      if (editingItem) {
        await editItem(editingItem.id, name, quantity);
      } else {
        await addItem(name, quantity);
      }
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  }

  const checkedCount = items.filter((i) => i.is_checked).length;
  const totalCount = items.length;

  if (loading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" color="#4F7942" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      {/* Header */}
      <View className="bg-surface px-6 pt-14 pb-4 border-b border-line">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 w-10 h-10 rounded-full bg-line items-center justify-center"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={18} color="#767C6C" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-ink" numberOfLines={1}>
              {listName}
            </Text>
            {!roleLoading && role && role !== 'owner' && (
              <View className="flex-row items-center mt-1">
                <View className="bg-brand-clay/15 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-brand-clay capitalize">
                    {role}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ShareList', { listId, listName, ownerId })
              }
              className="w-10 h-10 rounded-full bg-line items-center justify-center"
              accessibilityLabel="Share list"
            >
              <Icon name="share-2" size={18} color="#4F7942" />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View className="mt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-ink-soft">
                {checkedCount} of {totalCount} done
              </Text>
              <Text className="text-xs text-brand-green-deep font-medium">
                {Math.round((checkedCount / totalCount) * 100)}%
              </Text>
            </View>
            <View className="h-1.5 bg-line rounded-full">
              <View
                className="h-1.5 bg-brand-green rounded-full"
                style={{
                  width: `${(checkedCount / totalCount) * 100}%`,
                }}
              />
            </View>
          </View>
        )}
      </View>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            role={role ?? 'viewer'}
            onToggle={checkItem}
            onEdit={handleEdit}
            onDelete={removeItem}
          />
        )}
        getItemLayout={(_, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
        windowSize={7}
        maxToRenderPerBatch={15}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            icon="check-circle"
            title="No items yet"
            message={
              canMutateItems
                ? 'Tap + to add your first item'
                : 'No items in this list'
            }
          />
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      {canMutateItems && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          disabled={submitting}
          className="absolute bottom-8 right-6 bg-brand-green w-14 h-14 rounded-full items-center justify-center shadow-lg"
          accessibilityLabel="Add new item"
        >
          {submitting ? (
            <ActivityIndicator color="#2E3527" />
          ) : (
            <Icon name="plus" size={24} color="#2E3527" />
          )}
        </TouchableOpacity>
      )}

      <ItemModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
      />
    </View>
  );
}
