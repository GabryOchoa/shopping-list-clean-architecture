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
import { useShareList } from '../hooks/useShareList';
import { useAuth } from '../context/AuthContext';
import MemberRow from '../components/MemberRow';
import InviteModal from '../components/InviteModal';
import ErrorBanner from '../components/ErrorBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareList'>;

export default function ShareListScreen({ route, navigation }: Props) {
  const { listId, listName, ownerId } = route.params;
  const { user } = useAuth();
  const {
    members,
    loading,
    error,
    clearError,
    refresh,
    inviteByEmail,
    changeRole,
    kickMember,
  } = useShareList(listId);

  const [modalVisible, setModalVisible] = useState(false);

  const isOwner = user?.id === ownerId;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 bg-gray-100 rounded-xl px-3 py-2"
          >
            <Text className="text-gray-600 text-sm">← Back</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">Sharing</Text>
            <Text className="text-sm text-gray-400 mt-0.5" numberOfLines={1}>
              {listName}
            </Text>
          </View>

          {/* Only owners can invite */}
          {isOwner && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-indigo-600 rounded-xl px-4 py-2"
            >
              <Text className="text-white text-sm font-semibold">+ Invite</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role legend */}
      <View className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
        <Text className="text-xs text-indigo-600">
          <Text className="font-semibold">Viewer</Text> — can see items only
          {'   '}
          <Text className="font-semibold">Editor</Text> — can add, edit and
          check off items
        </Text>
      </View>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* Members list */}
      {loading && members.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-1">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          }
          renderItem={({ item }) => (
            <MemberRow
              member={item}
              isOwner={isOwner}
              onChangeRole={changeRole}
              onRemove={kickMember}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-gray-400 text-base">No members yet</Text>
              {isOwner && (
                <Text className="text-gray-400 text-sm mt-1">
                  Tap + Invite to share this list
                </Text>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
        />
      )}

      <InviteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onInvite={inviteByEmail}
      />
    </View>
  );
}
