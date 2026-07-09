import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAuthActions } from '../hooks/useAuthActions';
import ListCard from '../components/ListCard';
import ListModal from '../components/ListModal';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { List, ListRole } from '../types';
import { SharedListEntry } from '../services/lists';

type Props = {
  lists: List[];
  sharedEntries: SharedListEntry[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  addList: (name: string, description?: string) => Promise<void>;
  editList: (id: string, name: string, description?: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;
  onNavigate: (
    screen: 'ListDetail',
    params: { listId: string; listName: string; ownerId: string },
  ) => void;
};

export default function MyListsScreen({
  lists,
  loading,
  error,
  clearError,
  refresh,
  addList,
  editList,
  removeList,
  onNavigate,
}: Props) {
  const { user } = useAuth();
  const { handleSignOut } = useAuthActions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleEdit(list: List) {
    setEditingList(list);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setEditingList(null);
  }

  async function handleSubmit(name: string, description?: string) {
    try {
      setSubmitting(true);
      if (editingList) {
        await editList(editingList.id, name, description);
      } else {
        await addList(name, description);
      }
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && lists.length === 0) {
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar name={user?.email ?? '?'} size={36} className="mr-3" />
            <View>
              <Text className="text-2xl font-bold text-ink">My Lists</Text>
              <Text className="text-sm text-ink-soft mt-0.5">
                {user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-10 h-10 rounded-full bg-line items-center justify-center"
            accessibilityLabel="Sign out"
          >
            <Icon name="log-out" size={18} color="#767C6C" />
          </TouchableOpacity>
        </View>
      </View>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ListCard
            list={item}
            role="owner"
            onPress={(list) =>
              onNavigate('ListDetail', {
                listId: list.id,
                listName: list.name,
                ownerId: list.owner_id,
              })
            }
            onEdit={handleEdit}
            onDelete={removeList}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="shopping"
            title="No lists yet"
            message="Tap the + button to create your first shopping list"
            iconFamily="material"
          />
        }
        windowSize={7}
        maxToRenderPerBatch={15}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={submitting}
        className="absolute bottom-8 right-6 bg-brand-green w-14 h-14 rounded-full items-center justify-center shadow-lg"
        accessibilityLabel="Create new list"
      >
        {submitting ? (
          <ActivityIndicator color="#2E3527" />
        ) : (
          <Icon name="plus" size={24} color="#2E3527" />
        )}
      </TouchableOpacity>

      <ListModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingList={editingList}
      />
    </View>
  );
}
