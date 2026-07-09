import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

type Props = {
  name: string;
  size?: number;
  className?: string;
};

export default function Avatar({ name, size = 40, className = '' }: Props) {
  const initials = useMemo(() => {
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <View
      className={`rounded-full bg-brand-green items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Text
        className="text-ink font-semibold"
        style={{ fontSize: size * 0.35 }}
      >
        {initials}
      </Text>
    </View>
  );
}
