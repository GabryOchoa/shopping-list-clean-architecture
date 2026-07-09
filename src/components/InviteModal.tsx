import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { mapError } from '../utils/mapError';
import Icon from './Icon';

type Props = {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, role: 'viewer' | 'editor') => Promise<void>;
};

export default function InviteModal({ visible, onClose, onInvite }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setEmail('');
    setRole('viewer');
    setError(null);
    onClose();
  }

  async function handleInvite() {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onInvite(trimmed, role);
      handleClose();
    } catch (e: any) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-surface rounded-t-3xl px-6 pt-3 pb-10">
          {/* Handle bar */}
          <View className="w-10 h-1 bg-line rounded-full self-center mb-4" />

          <Text className="text-xl font-bold text-ink mb-2">
            Invite someone
          </Text>
          <Text className="text-sm text-ink-soft mb-6">
            They need an account in the app to be invited.
          </Text>

          {/* Email input */}
          <Text className="text-sm font-medium text-ink-soft mb-1">
            Email address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="friend@example.com"
            placeholderTextColor="#767C6C"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-line rounded-xl px-4 py-3 text-base text-ink mb-4"
            autoFocus
          />

          {/* Role selector */}
          <Text className="text-sm font-medium text-ink-soft mb-2">Role</Text>
          <View className="flex-row gap-3 mb-6">
            {(['viewer', 'editor'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 rounded-xl py-3 items-center border ${
                  role === r
                    ? 'bg-brand-green border-brand-green'
                    : 'bg-surface border-line'
                }`}
              >
                <View className="flex-row items-center">
                  <Icon
                    name={r === 'viewer' ? 'eye' : 'edit-3'}
                    size={14}
                    color={role === r ? '#2E3527' : '#767C6C'}
                  />
                  <Text
                    className={`text-sm font-semibold capitalize ml-1.5 ${
                      role === r ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {r}
                  </Text>
                </View>
                <Text
                  className={`text-xs mt-0.5 ${
                    role === r ? 'text-ink/60' : 'text-ink-soft'
                  }`}
                >
                  {r === 'viewer' ? 'Can view only' : 'Can edit items'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text className="text-danger text-sm mb-4">{error}</Text>}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 border border-line rounded-xl py-4 items-center"
            >
              <Text className="text-ink-soft font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInvite}
              disabled={loading}
              className="flex-1 bg-brand-green rounded-xl py-4 items-center flex-row justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#2E3527" />
              ) : (
                <>
                  <Icon name="user-plus" size={16} color="#2E3527" />
                  <Text className="text-ink font-semibold ml-2">
                    Send invite
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
