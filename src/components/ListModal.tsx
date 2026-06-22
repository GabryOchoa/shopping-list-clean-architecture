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

  // Pre-fill form when editing
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
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <Text className="text-xl font-bold text-gray-800 mb-6">
            {isEditing ? 'Edit list' : 'New list'}
          </Text>

          <Text className="text-sm font-medium text-gray-600 mb-1">Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Weekly groceries"
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
            autoFocus
          />

          <Text className="text-sm font-medium text-gray-600 mb-1">
            Description (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a short description..."
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
            multiline
            numberOfLines={3}
          />

          {error && <Text className="text-red-500 text-sm mb-4">{error}</Text>}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="flex-1 bg-indigo-600 rounded-xl py-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">
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
