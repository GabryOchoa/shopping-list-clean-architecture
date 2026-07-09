import React from 'react';
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
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { SharedListEntry } from '../services/lists';

type Props = {
  sharedEntries: SharedListEntry[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  onNavigate: (
    screen: 'ListDetail',
    params: { listId: string; listName: string; ownerId: string },
  ) => void;
};

export default function SharedListsScreen({
  sharedEntries,
  loading,
  error,
  clearError,
  refresh,
  onNavigate,
}: Props) {
  const { user } = useAuth();
  const { handleSignOut } = useAuthActions();

  if (loading && sharedEntries.length === 0) {
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
              <Text className="text-2xl font-bold text-ink">Shared</Text>
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
        data={sharedEntries}
        keyExtractor={(item) => item.list.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ListCard
            list={item.list}
            role={item.role}
            onPress={(list) =>
              onNavigate('ListDetail', {
                listId: list.id,
                listName: list.name,
                ownerId: list.owner_id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="No shared lists"
            message="Lists shared with you will appear here"
          />
        }
        windowSize={7}
        maxToRenderPerBatch={15}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />
    </View>
  );
}
