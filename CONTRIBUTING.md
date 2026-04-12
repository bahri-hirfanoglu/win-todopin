# Contributing to TodoPin

Thank you for your interest in contributing to TodoPin! This guide will help you get started.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/) (stable)
- [Tauri v2 prerequisites](https://tauri.app/start/prerequisites/)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/bahri-hirfanoglu/win-todopin.git
cd win-todopin

# Install frontend dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Building

```bash
# Build for production
pnpm tauri build
```

Installers will be generated in `src-tauri/target/release/bundle/`.

## Project Structure

```
win-todopin/
├── src/                    # Frontend (Svelte + TypeScript)
│   ├── card/               # Card window component
│   ├── manager/            # Manager window component
│   ├── lib/                # Shared libraries (API, i18n, themes)
│   └── styles/             # CSS stylesheets
├── src-tauri/              # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── commands.rs     # Tauri IPC commands
│   │   ├── models.rs       # Data models
│   │   ├── shortcuts.rs    # Global keyboard shortcuts
│   │   ├── state.rs        # Thread-safe state management
│   │   ├── storage.rs      # JSON persistence
│   │   ├── tray.rs         # System tray
│   │   └── windows.rs      # Multi-window management
│   └── capabilities/       # Tauri permissions
├── index.html              # Manager window entry point
└── card.html               # Card window entry point
```

## Guidelines

- Keep PRs focused and small
- Follow existing code style
- Test on Windows before submitting
- Update translations in `src/lib/i18n.ts` if adding user-facing strings

## Reporting Issues

Please use [GitHub Issues](https://github.com/bahri-hirfanoglu/win-todopin/issues) to report bugs or request features.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
