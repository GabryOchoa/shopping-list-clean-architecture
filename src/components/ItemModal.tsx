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
import { Item } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, quantity: number) => Promise<void>;
  editingItem?: Item | null;
};

export default function ItemModal({
  visible,
  onClose,
  onSubmit,
  editingItem,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setQuantity(String(editingItem.quantity));
    } else {
      setName('');
      setQuantity('1');
    }
    setError(null);
  }, [editingItem, visible]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    const parseQty = parseInt(quantity, 10);
    if (isNaN(parseQty) || parseQty < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(name.trim(), parseQty);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Quantity stepper helpers

  function increment() {
    setQuantity((prev) => String(Math.min(parseInt(prev || '0') + 1, 99)));
  }

  function decrement() {
    setQuantity((prev) => String(Math.max(parseInt(prev || '1') - 1, 1)));
  }

  const isEditing = !!editingItem;

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
            {isEditing ? 'Edit item' : 'Add item'}
          </Text>

          {/* Name */}
          <Text className="text-sm font-medium text-gray-600 mb-1">Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Olive oil"
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
            autoFocus
          />

          {/* Quantity stepper */}
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Quantity
          </Text>
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={decrement}
              className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
            >
              <Text className="text-xl text-gray-600">−</Text>
            </TouchableOpacity>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              className="w-16 text-center text-base text-gray-800 border border-gray-200 rounded-xl mx-2 py-2"
            />

            <TouchableOpacity
              onPress={increment}
              className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
            >
              <Text className="text-xl text-gray-600">+</Text>
            </TouchableOpacity>
          </View>

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
                  {isEditing ? 'Save changes' : 'Add item'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
