import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  message: string;
  onDismiss: () => void;
  autoHideMs?: number;
};

export default function ErrorBanner({
  message,
  onDismiss,
  autoHideMs = 5000,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, autoHideMs);
    return () => clearTimeout(timer);
  }, [message, autoHideMs, onDismiss]);

  if (!visible) return null;

  return (
    <View className="bg-danger/10 px-6 py-3 border-b border-danger/20 flex-row items-center justify-between">
      <Text className="text-danger text-sm flex-1 mr-2">{message}</Text>
      <TouchableOpacity
        onPress={() => setVisible(false)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-danger text-sm font-medium">Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}
