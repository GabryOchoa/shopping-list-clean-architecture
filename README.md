# Shopping List App

A mobile shopping list application built with React Native and Expo, featuring real-time collaboration through list sharing with role-based access control.

## Features

- Create, edit, and delete shopping lists with descriptions
- Add items with quantities and check them off as completed
- Progress bar showing completion percentage per list
- Share lists with other users via email invite
- Role-based access: **viewer** (read-only) and **editor** (full item management)
- Google OAuth authentication via Supabase
- Optimistic UI updates with rollback on failure
- Pull-to-refresh on all list screens
- Dismissible error banners with auto-hide

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | React Native 0.83 via Expo SDK 55             |
| Language   | TypeScript 5.9                                |
| Styling    | NativeWind 4.2 (Tailwind CSS 3.4)             |
| Backend    | Supabase (Auth, Database, Row Level Security) |
| Navigation | React Navigation 7                            |
| Testing    | Jest + React Native Testing Library           |
| Linting    | ESLint 9 + Prettier                           |
| Git Hooks  | Husky + lint-staged                           |

## Project Structure

```
shopping-list-app/
├── App.tsx                     # Root component with AuthProvider
├── src/
│   ├── types/                  # TypeScript type definitions
│   ├── db/                     # SQL schema and RLS policies
│   ├── services/               # Raw Supabase queries
│   │   ├── supabase.ts         # Client initialization
│   │   ├── auth.ts             # Google OAuth sign-in/out
│   │   ├── lists.ts            # List CRUD operations
│   │   ├── items.ts            # Item CRUD operations
│   │   └── sharing.ts          # Member management
│   ├── hooks/                  # React state wrappers around services
│   ├── context/                # AuthContext for session management
│   ├── navigation/             # Stack navigator (auth-gated)
│   ├── screens/                # Screen components
│   ├── components/             # Presentational UI components
│   ├── utils/                  # Error mapping utilities
│   └── __tests__/              # Unit and integration tests
├── assets/                     # App icons and splash screens
└── __mocks__/                  # Jest mocks for native modules
```

## Architecture

The project follows a layered architecture pattern:

```
Services → Hooks → Screens → Components
```

1. **Services** — raw Supabase queries with no React state
2. **Hooks** — wrap services with `useState` + `useCallback`, manage loading/error
3. **Screens** — compose hooks and components, handle navigation
4. **Components** — presentational only, receive data and callbacks via props

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project with Google OAuth configured

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/shopping-list-app.git
   cd shopping-list-app
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database

   Run the SQL files in your Supabase SQL Editor:

   - `src/db/schema_db_sl.sql` — creates tables, triggers, and helper functions
   - `src/db/rls_db_sl.sql` — enables Row Level Security with policies

5. Configure Google OAuth

   - Enable the Google provider in your Supabase dashboard
   - Set the redirect URI for deep linking in your Expo project

6. Start the development server

   ```bash
   npm start
   ```

## Available Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm start`       | Start Expo dev server     |
| `npm run android` | Build and run on Android  |
| `npm run ios`     | Build and run on iOS      |
| `npm run web`     | Start web version         |
| `npm test`        | Run Jest test suite       |
| `npm run lint`    | Run ESLint                |
| `npm run format`  | Format code with Prettier |

## Database Schema

| Table          | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `profiles`     | User profiles (auto-created from auth.users via trigger) |
| `lists`        | Shopping lists with owner, name, and description         |
| `items`        | Items within a list (name, quantity, checked status)     |
| `list_members` | Sharing bindings with viewer/editor roles                |

Row Level Security policies ensure users can only access lists they own or have been invited to.

## Testing

Tests are located in `src/__tests__/` and cover:

- **Services** — unit tests for auth, lists, items, and sharing queries
- **Hooks** — unit tests for useLists, useItems, useListRole, useShareList
- **Components** — role-gating behavior for ListCard, ItemRow, MemberRow
- **Integration** — end-to-end critical user flow test

Run the full test suite:

```bash
npm test
```

## Code Quality

- ESLint with Expo config for consistent linting
- Prettier for auto-formatting
- Husky pre-commit hooks via lint-staged
- Lint-staged runs ESLint + Prettier on staged `.ts/.tsx` files before each commit

## License

This project is private and not licensed for distribution.
