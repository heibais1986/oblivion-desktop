# Technology Stack

## Core Technologies

- **Runtime**: Node.js 20+ with npm 10+
- **Framework**: Electron 36+ for cross-platform desktop application
- **Frontend**: React 18+ with TypeScript 5+
- **Build System**: Webpack 5 with custom configurations
- **Package Manager**: npm with electron-builder for distribution

## Key Dependencies

- **UI Libraries**: react-router-dom, react-hot-toast, react-modern-drawer
- **State Management**: zustand for lightweight state management
- **Networking**: axios for HTTP requests, @grpc/grpc-js for gRPC
- **System Integration**: electron-settings, systeminformation, regedit (Windows)
- **Audio**: node-aplay, sound-play for notification sounds
- **Utilities**: lodash, classnames, tree-kill

## Development Tools

- **TypeScript**: Strict mode enabled with ES2022 target
- **Linting**: ESLint with erb config, custom rules for React/TypeScript
- **Formatting**: Prettier with single quotes, 2-space indentation
- **Testing**: Jest with React Testing Library, jsdom environment
- **Git Hooks**: Husky for pre-commit (prettier) and pre-push (type checking)

## Build Configuration

- **Webpack**: Separate configs for main/renderer processes, dev/prod environments
- **Electron Builder**: Multi-platform packaging (Windows NSIS/ZIP, macOS DMG/ZIP, Linux DEB/RPM/AppImage)
- **Asset Management**: Static assets in `/assets`, binaries in `/assets/bin`

## Common Commands

```bash
# Development
npm start          # Start development server
npm run dev        # Alias for start
npm run build      # Build for production
npm run package    # Package for current platform

# Platform-specific packaging
npm run package:windows
npm run package:mac
npm run package:linux

# Code Quality
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run tsc        # TypeScript type checking
npm test          # Run Jest tests

# Utilities
npm run prepare    # Download binaries and setup husky
npm run rebuild    # Rebuild native dependencies
```

## Development Environment

- **Hot Reload**: Webpack dev server for renderer, electronmon for main process
- **Source Maps**: Enabled in development, production builds
- **DevTools**: React DevTools integration available
- **Port Management**: Automatic port conflict detection
