import React, { useState, useEffect } from 'react';
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
import { List } from '../types';
import { mapError } from '../utils/mapError';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
  editingList?: List | null;
};

export default function ListModal({
  visible,
  onClose,
  onSubmit,
  editingList,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingList) {
      setName(editingList.name);
      setDescription(editingList.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [editingList, visible]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(name.trim(), description.trim() || undefined);
      onClose();
    } catch (e: any) {
      setError(mapError(e));
    } finally {
      setLoading(false);
    }
  }

  const isEditing = !!editingList;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-surface rounded-t-3xl px-6 pt-3 pb-10">
          {/* Handle bar */}
          <View className="w-10 h-1 bg-line rounded-full self-center mb-4" />

          <Text className="text-xl font-bold text-ink mb-6">
            {isEditing ? 'Edit list' : 'New list'}
          </Text>

          <Text className="text-sm font-medium text-ink-soft mb-1">Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Weekly groceries"
            placeholderTextColor="#767C6C"
            className="border border-line rounded-xl px-4 py-3 text-base text-ink mb-4"
            autoFocus
          />

          <Text className="text-sm font-medium text-ink-soft mb-1">
            Description (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a short description..."
            placeholderTextColor="#767C6C"
            className="border border-line rounded-xl px-4 py-3 text-base text-ink mb-4"
            multiline
            numberOfLines={3}
          />

          {error && <Text className="text-danger text-sm mb-4">{error}</Text>}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-line rounded-xl py-4 items-center"
            >
              <Text className="text-ink-soft font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="flex-1 bg-brand-green rounded-xl py-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#2E3527" />
              ) : (
                <Text className="text-ink font-semibold">
                  {isEditing ? 'Save changes' : 'Create list'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
