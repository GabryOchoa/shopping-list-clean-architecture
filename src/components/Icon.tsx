import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  family?: 'feather' | 'material';
};

const materialIcons = [
  'basket',
  'cart',
  'shopping',
  'shopping-outline',
] as const;

export default function Icon({
  name,
  size = 20,
  color = '#2E3527',
  family,
}: IconProps) {
  const useMaterial =
    family === 'material' ||
    (materialIcons as readonly string[]).includes(name);

  if (useMaterial) {
    return (
      <MaterialCommunityIcons
        name={name as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
      />
    );
  }

  return (
    <Feather
      name={name as keyof typeof Feather.glyphMap}
      size={size}
      color={color}
    />
  );
}
