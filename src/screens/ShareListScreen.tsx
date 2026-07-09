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
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

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
    <View className="flex-1 bg-paper">
      {/* Header */}
      <View className="bg-surface px-6 pt-14 pb-4 border-b border-line">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 w-10 h-10 rounded-full bg-line items-center justify-center"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={18} color="#767C6C" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-ink">Sharing</Text>
            <Text className="text-sm text-ink-soft mt-0.5" numberOfLines={1}>
              {listName}
            </Text>
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-brand-green rounded-xl px-4 py-2 flex-row items-center"
              accessibilityLabel="Invite member"
            >
              <Icon name="user-plus" size={14} color="#2E3527" />
              <Text className="text-ink text-sm font-semibold ml-1.5">
                Invite
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role legend */}
      <View className="px-6 py-3 bg-brand-green/10 border-b border-brand-green/20">
        <Text className="text-xs text-brand-green-deep">
          <Text className="font-semibold">Viewer</Text> — can see items only
          {'   '}
          <Text className="font-semibold">Editor</Text> — can add, edit and
          check off items
        </Text>
      </View>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {loading && members.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F7942" />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text className="text-xs text-ink-soft uppercase tracking-wide mb-3 px-1">
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
          getItemLayout={(_, index) => ({
            length: 68,
            offset: 68 * index,
            index,
          })}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="No members yet"
              message={
                isOwner
                  ? 'Tap Invite to share this list'
                  : 'No members have been added yet'
              }
            />
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
