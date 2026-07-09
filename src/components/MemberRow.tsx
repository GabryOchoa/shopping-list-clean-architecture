import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MemberWithProfile } from '../services/sharing';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Icon from './Icon';

type Props = {
  member: MemberWithProfile;
  isOwner: boolean;
  onChangeRole: (memberId: string, role: 'viewer' | 'editor') => void;
  onRemove: (memberId: string) => void;
};

function MemberRow({ member, isOwner, onChangeRole, onRemove }: Props) {
  const { user } = useAuth();
  const isCurrentUser = member.profile.id === user?.id;

  const displayName = useMemo(() => {
    return member.profile.display_name ?? '—';
  }, [member.profile.display_name]);

  const initialsName = useMemo(() => {
    return (member.profile.display_name ?? member.profile.email)
      .slice(0, 2)
      .toUpperCase();
  }, [member.profile.display_name, member.profile.email]);

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

  return (
    <View className="flex-row items-center bg-surface border border-line rounded-2xl px-4 py-3 mb-2">
      {/* Avatar */}
      <Avatar name={initialsName} size={40} className="mr-3" />

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">
          {displayName}
          {isCurrentUser && (
            <Text className="text-ink-soft font-normal"> (you)</Text>
          )}
        </Text>
        <Text className="text-xs text-ink-soft mt-0.5">
          {member.profile.email}
        </Text>
      </View>

      {/* Role badge + actions */}
      <View className="flex-row items-center gap-2">
        {isOwner && !isCurrentUser ? (
          <TouchableOpacity
            onPress={handleRoleToggle}
            className={`rounded-xl px-3 py-1.5 flex-row items-center ${
              member.role === 'editor' ? 'bg-brand-clay/15' : 'bg-line'
            }`}
          >
            <Icon
              name={member.role === 'editor' ? 'edit-3' : 'eye'}
              size={12}
              color={member.role === 'editor' ? '#C97B4A' : '#767C6C'}
            />
            <Text
              className={`text-xs font-medium ml-1 ${
                member.role === 'editor' ? 'text-brand-clay' : 'text-ink-soft'
              }`}
            >
              {member.role}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-line rounded-xl px-3 py-1.5 flex-row items-center">
            <Icon
              name={member.role === 'editor' ? 'edit-3' : 'eye'}
              size={12}
              color="#767C6C"
            />
            <Text className="text-xs text-ink-soft ml-1">{member.role}</Text>
          </View>
        )}

        {(isOwner && !isCurrentUser) || isCurrentUser ? (
          <TouchableOpacity
            onPress={handleRemove}
            className="bg-danger/10 rounded-xl px-3 py-1.5 flex-row items-center"
          >
            <Icon
              name={isCurrentUser ? 'log-out' : 'x'}
              size={12}
              color="#C1473F"
            />
            <Text className="text-xs text-danger ml-1">
              {isCurrentUser ? 'Leave' : 'Remove'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default React.memo(MemberRow);
