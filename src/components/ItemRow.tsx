import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Item, ListRole } from "../types";

type Props = {
  item: Item;
  role: ListRole;
  onToggle: (id: string, isChecked: boolean) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
};

export default function ItemRow({
  item,
  role,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const canMutate = role === "owner" || role === "editor";

  function handleDelete() {
    Alert.alert("Delete item", `Remove "${item.name}" from this list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(item.id),
      },
    ]);
  }

  return (
    <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-2">
      {/* Checkbox */}
      <TouchableOpacity
        onPress={() => onToggle(item.id, !item.is_checked)}
        className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
          item.is_checked
            ? "bg-indigo-600 border-indigo-600"
            : "border-gray-300"
        }`}
      >
        {item.is_checked && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
      </TouchableOpacity>

      {/* Name and quantity */}
      <View className="flex-1">
        <Text
          className={`text-base ${
            item.is_checked ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {item.name}
        </Text>
        {item.quantity > 1 && (
          <Text className="text-xs text-gray-400 mt-0.5">
            Qty: {item.quantity}
          </Text>
        )}
      </View>

      {/* Actions — only for owner or editor */}
      {canMutate && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="bg-gray-100 rounded-xl px-3 py-1.5"
          >
            <Text className="text-sm text-gray-600">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-50 rounded-xl px-3 py-1.5"
          >
            <Text className="text-sm text-red-500">Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
