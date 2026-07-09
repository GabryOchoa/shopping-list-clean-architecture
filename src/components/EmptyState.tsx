import React from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon';

type Props = {
  icon: string;
  title: string;
  message: string;
  iconFamily?: 'feather' | 'material';
};

export default function EmptyState({
  icon,
  title,
  message,
  iconFamily,
}: Props) {
  return (
    <View className="items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-full bg-line items-center justify-center mb-4">
        <Icon name={icon} size={28} color="#767C6C" family={iconFamily} />
      </View>
      <Text className="text-base font-semibold text-ink text-center mb-1">
        {title}
      </Text>
      <Text className="text-sm text-ink-soft text-center">{message}</Text>
    </View>
  );
}
