import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MemberWithProfile } from '../services/sharing';
import { useAuth } from '../context/AuthContext';

type Props = {
  member: MemberWithProfile;
  isOwner: boolean; // true if the current user owns the list
  onChangeRole: (memberId: string, role: 'viewer' | 'editor') => void;
  onRemove: (memberId: string) => void;
};

export default function MemberRow({
  member,
  isOwner,
  onChangeRole,
  onRemove,
}: Props) {
  const { user } = useAuth();
  const isCurrentUser = member.profile.id === user?.id;

  function handleRemove() {
    const label = isCurrentUser ? 'Leave list' : 'Remove member';
    const message = isCurrentUser
      ? 'Are you sure you want to leave this list?'
      : `Remove ${member.profile.display_name ?? member.profile.email} from this list?`;

    Alert.alert(label, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isCurrentUser ? 'Leave' : 'Remove',
        style: 'destructive',
        onPress: () => onRemove(member.id),
      },
    ]);
  }

  function handleRoleToggle() {
    const newRole = member.role === 'viewer' ? 'editor' : 'viewer';
    onChangeRole(member.id, newRole);
  }

  // Avatar initials fallback
  const initials = (member.profile.display_name ?? member.profile.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-2">
      {/* Avatar */}
      <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
        <Text className="text-indigo-600 font-semibold text-sm">
          {initials}
        </Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          {member.profile.display_name ?? '—'}
          {isCurrentUser && (
            <Text className="text-gray-400 font-normal"> (you)</Text>
          )}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {member.profile.email}
        </Text>
      </View>

      {/* Role badge + actions — only owner can change roles */}
      <View className="flex-row items-center gap-2">
        {isOwner && !isCurrentUser ? (
          <TouchableOpacity
            onPress={handleRoleToggle}
            className={`rounded-xl px-3 py-1.5 ${
              member.role === 'editor' ? 'bg-indigo-50' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                member.role === 'editor' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              {member.role}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-gray-100 rounded-xl px-3 py-1.5">
            <Text className="text-xs text-gray-500">{member.role}</Text>
          </View>
        )}

        {/* Owner can remove anyone; members can only leave */}
        {(isOwner && !isCurrentUser) || isCurrentUser ? (
          <TouchableOpacity
            onPress={handleRemove}
            className="bg-red-50 rounded-xl px-3 py-1.5"
          >
            <Text className="text-xs text-red-500">
              {isCurrentUser ? 'Leave' : 'Remove'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
