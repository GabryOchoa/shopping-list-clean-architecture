import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLists } from "../hooks/useLists";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../services/auth";
import ListCard from "../components/ListCard";
import ListModal from "../components/ListModal";
import { List } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Lists">;

export default function ListsScreen({ navigation }: Props) {
  const {
    lists,
    sharedEntries,
    loading,
    error,
    refresh,
    addList,
    editList,
    removeList,
  } = useLists();
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  function handleEdit(list: List) {
    setEditingList(list);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setEditingList(null);
  }

  async function handleSubmit(name: string, description?: string) {
    if (editingList) {
      await editList(editingList.id, name, description);
    } else {
      await addList(name, description);
    }
  }

  if (loading && lists.length === 0 && sharedEntries.length === 0) {
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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">My Lists</Text>
            <Text className="text-sm text-gray-400 mt-1">{user?.email}</Text>
          </View>
          <TouchableOpacity
            onPress={signOut}
            className="bg-gray-100 rounded-xl px-4 py-2"
          >
            <Text className="text-sm text-gray-600">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error banner */}
      {error && (
        <View className="bg-red-50 px-6 py-3 border-b border-red-100">
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* My Lists section */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              My Lists
            </Text>

            {lists.length === 0 && (
              <View className="items-center justify-center py-10 mb-6">
                <Text className="text-gray-400 text-base">No lists yet</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Tap + to create your first one
                </Text>
              </View>
            )}

            {lists.map((item) => (
              <ListCard
                key={item.id}
                list={item}
                role="owner"
                onPress={(list) =>
                  navigation.navigate("ListDetail", {
                    listId: list.id,
                    listName: list.name,
                    ownerId: list.owner_id,
                  })
                }
                onEdit={handleEdit}
                onDelete={removeList}
              />
            ))}

            {/* Shared with me section */}
            {sharedEntries.length > 0 && (
              <>
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">
                  Shared with me
                </Text>

                {sharedEntries.map((entry) => (
                  <ListCard
                    key={entry.list.id}
                    list={entry.list}
                    role={entry.role}
                    onPress={(list) =>
                      navigation.navigate("ListDetail", {
                        listId: list.id,
                        listName: list.name,
                        ownerId: list.owner_id,
                      })
                    }
                    onEdit={handleEdit}
                    onDelete={removeList}
                  />
                ))}
              </>
            )}
          </>
        }
        renderItem={() => null}
        ListEmptyComponent={null}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      {/* FAB — create new list */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>

      <ListModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingList={editingList}
      />
    </View>
  );
}
