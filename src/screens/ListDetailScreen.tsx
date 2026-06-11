import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useItems } from "../hooks/useItems";
import { useListRole } from "../hooks/useListRole";
import ItemRow from "../components/ItemRow";
import ItemModal from "../components/ItemModal";
import { Item } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ListDetail">;

export default function ListDetailScreen({ route, navigation }: Props) {
  const { listId, listName, ownerId } = route.params;
  const {
    items,
    loading,
    error,
    refresh,
    addItem,
    editItem,
    checkItem,
    removeItem,
  } = useItems(listId);

  const { role, loading: roleLoading } = useListRole(listId, ownerId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const canMutateItems = role === "owner" || role === "editor";
  const isOwner = role === "owner";

  function handleEdit(item: Item) {
    setEditingItem(item);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setEditingItem(null);
  }

  async function handleSubmit(name: string, quantity: number) {
    if (editingItem) {
      await editItem(editingItem.id, name, quantity);
    } else {
      await addItem(name, quantity);
    }
  }

  //Progress summary
  const checkedCount = items.filter((i) => i.is_checked).length;
  const totalCount = items.length;

  if (loading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 bg-gray-100 rounded-xl px-3 py-2"
          >
            <Text className="text-gray-600 text-sm">← Back</Text>
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className="text-2xl font-bold text-gray-800"
              numberOfLines={1}
            >
              {listName}
            </Text>
            {!roleLoading && role && role !== "owner" && (
              <View className="flex-row items-center mt-1">
                <View className="bg-indigo-100 rounded-full px-2 py-0.5">
                  <Text className="text-xs text-indigo-600 capitalize">
                    {role}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Share button — owner only */}
          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ShareList", { listId, listName, ownerId })
              }
              className="bg-gray-100 rounded-xl px-3 py-2"
            >
              <Text className="text-gray-600 text-sm">Share</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View className="mt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-400">
                {checkedCount} of {totalCount} done
              </Text>
              <Text className="text-xs text-indigo-600 font-medium">
                {Math.round((checkedCount / totalCount) * 100)}%
              </Text>
            </View>
            <View className="h-1.5 bg-gray-100 rounded-full">
              <View
                className="h-1.5 bg-indigo-600 rounded-full"
                style={{
                  width: `${(checkedCount / totalCount) * 100}%`,
                }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Error banner */}
      {error && (
        <View className="bg-red-50 px-6 py-3 border-b border-red-100">
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            role={role ?? "viewer"}
            onToggle={checkItem}
            onEdit={handleEdit}
            onDelete={removeItem}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-base">No items yet</Text>
            {canMutateItems && (
              <Text className="text-gray-400 text-sm mt-1">
                Tap + to add your first item
              </Text>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      {/* FAB — owner or editor only */}
      {canMutateItems && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-8 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>
      )}

      <ItemModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
      />
    </View>
  );
}
