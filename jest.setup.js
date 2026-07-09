// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock Expo modules
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel', url: '' }),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn().mockReturnValue('exp://localhost:19000/--/auth/callback'),
  openURL: jest.fn().mockResolvedValue(),
  getInitialURL: jest.fn().mockResolvedValue(''),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

// Mock react-native-css-interop to avoid JSX parse issues in tests
jest.mock('react-native-css-interop', () => ({}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Enable React act() environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
