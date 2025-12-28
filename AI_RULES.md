# AI Development Rules for CDU Scheduling Dashboard

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components (prebuilt)
- **State Management**: React Context API
- **Data Validation**: Zod with React Hook Form
- **Icons**: Lucide React
- **Toast Notifications**: Sonner and Radix UI Toast
- **Data Persistence**: localStorage

## Library Usage Rules

### UI Components
- **Primary Choice**: Use prebuilt shadcn/ui components whenever possible
- **Custom Components**: Create new components in `src/components` when shadcn/ui doesn't have what's needed
- **Styling**: Always use Tailwind CSS classes for styling; avoid inline styles
- **Icons**: Use Lucide React icons exclusively for all iconography

### State Management
- **Global State**: Use React Context API through custom providers in `src/contexts`
- **Form State**: Use React Hook Form for all forms with Zod for validation
- **Local State**: Use React's useState and useReducer for component-level state

### Data Handling
- **Validation**: Use Zod schemas defined in `src/schemas` for all data validation
- **Types**: Define TypeScript interfaces in `src/types` for all data structures
- **Persistence**: Use localStorage for client-side data persistence through the DataContext

### Routing
- **Navigation**: Use React Router v6 for all routing needs
- **Route Structure**: Define routes in `src/App.tsx` with pages in `src/pages`

### Notifications
- **Toast Messages**: Use Sonner for simple notifications and Radix UI Toast for complex toasts
- **Alerts**: Use shadcn/ui Alert component for in-page notifications

### Data Display
- **Tables**: Use shadcn/ui Table component for data tables
- **Cards**: Use shadcn/ui Card component for content containers
- **Lists**: Use appropriate shadcn/ui components (List, Card, etc.)

### Forms
- **Form Handling**: Always use React Hook Form with Zod resolver
- **Form Components**: Use shadcn/ui form components (Input, Textarea, Select, etc.)
- **Validation**: Define Zod schemas in `src/schemas` for form validation

### Modals and Dialogs
- **Modal Component**: Use shadcn/ui Dialog for all modal windows
- **Sheet Component**: Use shadcn/ui Sheet for side panels

### Hooks
- **Custom Hooks**: Create reusable logic in `src/hooks`
- **Built-in Hooks**: Use React built-in hooks (useState, useEffect, etc.) as needed

### Utilities
- **Helper Functions**: Place utility functions in `src/lib/utils.ts` or create separate utility files
- **Class Names**: Use `cn` function from `src/lib/utils.ts` for conditional class names
- **Text Processing**: Implement text processing functions in `src/lib`

### File Structure
- **Components**: `src/components` - Reusable UI components
- **Pages**: `src/pages` - Top-level page components
- **Contexts**: `src/contexts` - React context providers
- **Hooks**: `src/hooks` - Custom React hooks
- **Lib**: `src/lib` - Utility functions and helpers
- **Types**: `src/types` - TypeScript type definitions
- **Schemas**: `src/schemas` - Zod validation schemas
- **Data**: `src/data` - Initial data and constants
- **Assets**: `src/assets` - Images and static assets

### Styling Guidelines
- **Design System**: Follow the color palette and design tokens defined in `src/index.css`
- **Responsive Design**: Use Tailwind's responsive prefixes for all responsive styles
- **Dark Mode**: Implement dark mode support using the existing theme context
- **Accessibility**: Ensure proper ARIA attributes and keyboard navigation support

### Data Management
- **Context Pattern**: Use the DataContext pattern for managing application state
- **Local Storage**: Implement save/load functionality through the DataContext
- **Data Structure**: Follow the existing data structure patterns in `src/types/data.ts`