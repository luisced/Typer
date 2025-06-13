# Frontend Architecture Guide

## Directory Structure

```
src/
├── app/                          # App-level configuration
│   ├── providers/               # Context providers setup
│   ├── router/                  # Route configuration
│   └── store/                   # Global state management
├── shared/                      # Shared/reusable code
│   ├── components/              # Reusable UI components
│   │   ├── ui/                 # Basic UI components (buttons, inputs, etc.)
│   │   ├── layout/             # Layout components
│   │   └── common/             # Common business components
│   ├── hooks/                   # Shared custom hooks
│   ├── utils/                   # Utility functions
│   ├── constants/               # App constants
│   ├── types/                   # TypeScript type definitions
│   ├── api/                     # API client and base configurations
│   └── assets/                  # Static assets
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication feature
│   │   ├── components/         # Feature-specific components
│   │   ├── hooks/              # Feature-specific hooks
│   │   ├── services/           # API calls for this feature
│   │   ├── stores/             # Feature-specific state
│   │   ├── types/              # Feature-specific types
│   │   └── index.ts            # Barrel export
│   ├── typing-test/             # Typing test feature
│   ├── profile/                 # User profile feature
│   ├── leaderboard/             # Leaderboard feature
│   └── settings/                # Settings feature
├── pages/                       # Page components (route entry points)
└── styles/                      # Global styles and themes
```

## Naming Conventions

### Files and Folders
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useTypingTest.ts`)
- **Utils**: camelCase (e.g., `formatTime.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types**: PascalCase (e.g., `User.types.ts`)

### Component Structure
Each component should follow this structure:
```tsx
// 1. External imports
import React from 'react'
import { Box, Button } from '@chakra-ui/react'

// 2. Internal imports
import { useTypingTest } from '@/features/typing-test'
import { formatTime } from '@/shared/utils'

// 3. Types
interface ComponentProps {
  // props definition
}

// 4. Component
export const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  )
}

// 5. Default export (if needed)
export default Component
```

## Feature Module Structure

Each feature should be self-contained with:
- `components/` - Feature-specific UI components
- `hooks/` - Feature-specific custom hooks
- `services/` - API calls and data fetching
- `stores/` - Feature-specific state management
- `types/` - TypeScript interfaces and types
- `constants/` - Feature-specific constants
- `utils/` - Feature-specific utility functions
- `index.ts` - Barrel export for clean imports

## Best Practices

### Import Organization
1. External libraries first
2. Internal shared modules
3. Feature-specific modules
4. Relative imports last

### Component Guidelines
- Keep components under 200 lines
- Use composition over inheritance
- Extract custom hooks for complex logic
- Use TypeScript strictly
- Write descriptive prop interfaces

### State Management
- Use Zustand for global state
- Use React Query for server state
- Keep local state in components when possible
- Use context sparingly for theme/auth only

### Testing Structure
- Unit tests: `*.test.tsx` next to components
- Integration tests: `__tests__/` folder in features
- E2E tests: `cypress/` in project root

## Development Workflow

1. **New Feature**: Create in `features/` directory
2. **Shared Component**: Add to `shared/components/`
3. **Page**: Create in `pages/` and connect to router
4. **API**: Add service to appropriate feature or shared
5. **Types**: Define in feature or shared types

## Code Quality Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for quality checks
- **Lint-staged**: Run linters on staged files