import React, { useState, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLists } from "../hooks/useLists";
import { useAuth } from "../context/AuthContext";
import { useAuthActions } from "../hooks/useAuthActions";
import ListCard from "../components/ListCard";
import ListModal from "../components/ListModal";
import { List, ListRole } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Lists">;

type ListItem = {
  list: List;
  role: ListRole;
};

type Section = {
  title: string;
  data: ListItem[];
};

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
  const { handleSignOut } = useAuthActions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  const sections = useMemo<Section[]>(() => {
    const ownedSection: Section = {
      title: "My Lists",
      data: lists.map((list) => ({ list, role: "owner" as ListRole })),
    };

    const sharedSection: Section = {
      title: "Shared with me",
      data: sharedEntries.map((entry) => ({
        list: entry.list,
        role: entry.role,
      })),
    };

    return sharedSection.data.length > 0
      ? [ownedSection, sharedSection]
      : [ownedSection];
  }, [lists, sharedEntries]);

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
            onPress={handleSignOut}
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.list.id}
        contentContainerStyle={{ padding: 16 }}
        renderSectionHeader={({ section }) => (
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <ListCard
            list={item.list}
            role={item.role}
            onPress={(list) =>
              navigation.navigate("ListDetail", {
                listId: list.id,
                listName: list.name,
                ownerId: list.owner_id,
              })
            }
            onEdit={item.role === "owner" ? handleEdit : undefined}
            onDelete={item.role === "owner" ? removeList : undefined}
          />
        )}
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
