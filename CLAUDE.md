# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start dev server**: `npm run dev` - Starts Vite dev server with HMR
- **Build for production**: `npm run build` - Creates production build in `dist/`
- **Lint code**: `npm run lint` - Runs ESLint on all JS/JSX files
- **Preview build**: `npm run preview` - Serves production build locally

## Project Architecture

This is a React + Vite application with a minimal setup:

- **Framework**: React 19.2.0 with Vite 7.2.4 build tool
- **Entry point**: `src/main.jsx` - Renders the main App component
- **Main component**: `src/App.jsx` - Contains the main application logic
- **Styling**: CSS files (`src/index.css`, `src/App.css`)
- **Assets**: Static files in `public/` and component assets in `src/assets/`

## Code Style and Configuration

- **ESLint**: Configured with React hooks and refresh plugins
- **Custom rule**: Unused variables starting with uppercase letters or underscores are ignored
- **File extensions**: Use `.jsx` for React components, `.js` for utilities
- **ES modules**: Project uses ES module syntax (`type: "module"` in package.json)

## Key Files

- `vite.config.js` - Vite configuration with React plugin
- `eslint.config.js` - ESLint flat config setup
- `index.html` - HTML entry point with root div
- `package.json` - Dependencies and scripts