import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { List, ListRole } from "../types";

type Props = {
  list: List;
  role: ListRole;
  onPress: (list: List) => void;
  onEdit: (list: List) => void;
  onDelete: (id: string) => void;
};

export default function ListCard({
  list,
  role,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  const isOwner = role === "owner";

  function handleDelete() {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(list.id),
        },
      ],
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(list)}
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-gray-800">
              {list.name}
            </Text>
            {!isOwner && (
              <View className="ml-2 bg-indigo-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-indigo-600 capitalize">
                  {role}
                </Text>
              </View>
            )}
          </View>
          {list.description ? (
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
              {list.description}
            </Text>
          ) : null}
          <Text className="text-xs text-gray-400 mt-2">
            {new Date(list.created_at).toLocaleDateString()}
          </Text>
        </View>

        {isOwner && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onEdit(list)}
              className="bg-gray-100 rounded-xl px-3 py-2"
            >
              <Text className="text-sm text-gray-600">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-50 rounded-xl px-3 py-2"
            >
              <Text className="text-sm text-red-500">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
