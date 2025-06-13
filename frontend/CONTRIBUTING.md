# Contributing to Typer Frontend

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:5173`

## Directory Structure

Please refer to `ARCHITECTURE.md` for the complete directory structure and conventions.

## Development Guidelines

### Code Style
- Use TypeScript strictly - no `any` types
- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting
- Write meaningful component and variable names
- Add JSDoc comments for complex functions

### Component Development
```tsx
// ✅ Good - Well-structured component
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick: () => void
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  variant = 'primary', 
  onClick, 
  disabled 
}) => {
  return (
    <ChakraButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </ChakraButton>
  )
}
```

### Import Organization
```tsx
// 1. External library imports
import React from 'react'
import { Box, Button } from '@chakra-ui/react'

// 2. Internal shared imports
import { useAuth } from '@/features/auth'
import { formatTime } from '@/shared/utils'

// 3. Relative imports
import './Component.styles.css'
```

### State Management
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Zustand stores in `app/store/`
- **Server State**: Use React Query for API data
- **Feature State**: Create feature-specific stores in `features/[feature]/stores/`

### API Integration
```tsx
// ✅ Good - Using React Query
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/shared/api'

const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId
  })
}
```

### Testing
- Write unit tests for utilities and hooks
- Write component tests for complex logic
- Use `@testing-library/react` for component testing
- Place test files next to source files: `Component.test.tsx`

## Workflow

### Creating a New Feature
1. Create feature directory in `src/features/[feature-name]/`
2. Add required subdirectories: `components/`, `hooks/`, `services/`, etc.
3. Implement feature components and logic
4. Create barrel export in `index.ts`
5. Add route to `app/router/routes.tsx`
6. Update documentation if needed

### Adding a New Component
1. Determine if it's shared or feature-specific
   - **Shared**: Place in `shared/components/`
   - **Feature-specific**: Place in `features/[feature]/components/`
2. Create TypeScript interface for props
3. Implement component following style guidelines
4. Add to appropriate barrel export
5. Write tests if complex logic involved

### Making Changes
1. Create feature branch: `git checkout -b feature/description`
2. Make changes following guidelines
3. Run linting: `npm run lint`
4. Test your changes locally
5. Commit with descriptive message
6. Create pull request

## Path Aliases

Use these aliases for cleaner imports:
- `@/shared/*` - Shared utilities, components, types
- `@/features/*` - Feature modules
- `@/app/*` - App-level configuration
- `@/pages/*` - Page components
- `@/styles/*` - Styles and themes

## Common Patterns

### Custom Hooks
```tsx
// features/typing-test/hooks/useTypingTest.ts
export const useTypingTest = (text: string) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState<number[]>([])
  
  const handleKeyPress = useCallback((char: string) => {
    // Implementation
  }, [currentIndex])
  
  return {
    currentIndex,
    errors,
    handleKeyPress
  }
}
```

### API Services
```tsx
// features/auth/services/authService.ts
export const authService = {
  login: async (credentials: LoginCredentials) => {
    return await apiClient.post('/auth/login', credentials)
  },
  
  logout: async () => {
    return await apiClient.post('/auth/logout')
  }
}
```

## Performance Guidelines
- Use `React.memo` for expensive components
- Use `useCallback` and `useMemo` appropriately
- Lazy load pages with `React.lazy`
- Optimize bundle size with code splitting

## Troubleshooting

### Common Issues
1. **Import errors**: Check path aliases in `tsconfig.app.json`
2. **Type errors**: Ensure proper TypeScript interfaces
3. **Linting errors**: Run `npm run lint:fix`
4. **Build errors**: Check for missing dependencies

### Getting Help
- Check existing code for patterns
- Review `ARCHITECTURE.md` for structure guidelines
- Ask team members for code review
- Check TypeScript/React documentation