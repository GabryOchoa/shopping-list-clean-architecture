import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLists } from '../hooks/useLists';
import MyListsScreen from './MyListsScreen';
import SharedListsScreen from './SharedListsScreen';
import Icon from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Lists'>;

const Tab = createBottomTabNavigator();

export default function ListsScreen({ navigation }: Props) {
  const listsData = useLists();
  const insets = useSafeAreaInsets();

  function handleNavigate(
    screen: 'ListDetail',
    params: { listId: string; listName: string; ownerId: string },
  ) {
    navigation.navigate(screen, params);
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E3DCC8',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
          height: 60,
        },
        tabBarActiveTintColor: '#4F7942',
        tabBarInactiveTintColor: '#767C6C',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="MyListsTab"
        options={{
          tabBarLabel: 'My Lists',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="shopping"
              size={20}
              color={focused ? '#2E3527' : color}
              family="material"
            />
          ),
        }}
      >
        {() => (
          <MyListsScreen
            lists={listsData.lists}
            sharedEntries={listsData.sharedEntries}
            loading={listsData.loading}
            error={listsData.error}
            clearError={listsData.clearError}
            refresh={listsData.refresh}
            addList={listsData.addList}
            editList={listsData.editList}
            removeList={listsData.removeList}
            onNavigate={handleNavigate}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SharedTab"
        options={{
          tabBarLabel: 'Shared',
          tabBarIcon: ({ color, focused }) => (
            <Icon name="users" size={20} color={focused ? '#2E3527' : color} />
          ),
        }}
      >
        {() => (
          <SharedListsScreen
            sharedEntries={listsData.sharedEntries}
            loading={listsData.loading}
            error={listsData.error}
            clearError={listsData.clearError}
            refresh={listsData.refresh}
            onNavigate={handleNavigate}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
