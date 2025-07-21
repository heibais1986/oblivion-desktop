# Project Structure

## Root Directory

```
├── .erb/                    # Electron React Boilerplate configs
│   ├── configs/            # Webpack configurations
│   ├── scripts/            # Build and utility scripts
│   └── mocks/              # Test mocks
├── .github/                # GitHub workflows and templates
├── .husky/                 # Git hooks configuration
├── assets/                 # Static assets and resources
│   ├── bin/               # Platform-specific binaries
│   ├── css/               # Global stylesheets
│   ├── font/              # Custom fonts
│   ├── img/               # Images and icons
│   ├── json/              # Configuration JSON files
│   ├── proto/             # Protocol buffer definitions
│   └── sound/             # Audio files
├── release/                # Build output directory
│   └── app/               # Packaged application
├── script/                 # Custom build and utility scripts
└── src/                   # Source code
```

## Source Code Organization (`/src`)

```
src/
├── main/                   # Electron main process
│   ├── ipcListeners/      # IPC event handlers
│   ├── lib/               # Main process utilities
│   ├── main.ts            # Application entry point
│   ├── preload.ts         # Preload script for renderer
│   ├── ipc.ts             # IPC channel definitions
│   └── menu.ts            # Application menu setup
├── renderer/               # Electron renderer process (React app)
│   ├── components/        # Reusable React components
│   ├── pages/             # Page-level components
│   ├── lib/               # Renderer utilities and helpers
│   ├── hooks/             # Custom React hooks
│   ├── routes/            # Routing configuration
│   ├── context/           # React context providers
│   ├── App.tsx            # Main React application
│   ├── index.tsx          # React DOM entry point
│   └── store.ts           # Zustand state management
├── localization/           # Internationalization files
├── types/                  # TypeScript type definitions
├── __tests__/             # Test files
├── constants.ts           # Application constants
└── defaultSettings.ts     # Default configuration values
```

## Key Architectural Patterns

### Electron Process Separation

- **Main Process** (`src/main/`): Node.js environment, system APIs, window management
- **Renderer Process** (`src/renderer/`): Chromium environment, React UI
- **Preload Script** (`src/main/preload.ts`): Secure bridge between main and renderer

### React Application Structure

- **Pages** (`src/renderer/pages/`): Top-level route components (Settings, Rules, etc.)
- **Components** (`src/renderer/components/`): Reusable UI components
- **State Management**: Zustand store in `src/renderer/store.ts`
- **Routing**: React Router in `src/renderer/routes/`

### Configuration Management

- **Settings**: electron-settings for persistent storage
- **Defaults**: Centralized in `src/defaultSettings.ts`
- **Types**: Settings keys typed in `src/types/`

### Build System Organization

- **Webpack Configs**: Separate configs for main/renderer, dev/prod in `.erb/configs/`
- **Scripts**: Build automation in `script/` and `.erb/scripts/`
- **Assets**: Static resources organized by type in `assets/`

## File Naming Conventions

- **React Components**: PascalCase (e.g., `MyComponent.tsx`)
- **Utilities/Libs**: camelCase (e.g., `myUtility.ts`)
- **Constants**: camelCase with descriptive names
- **CSS Files**: Match component names (e.g., `MyComponent.css`)
- **Test Files**: `*.test.tsx` or `*.test.ts`

## Import Organization

- External libraries first
- Internal utilities and components
- Relative imports last
- CSS imports at the end
