# O MADEIRENSE | Cross-Platform Monorepo

This project demonstrates how to set up a monorepo containing both React (web) and React Native (mobile) applications that share code.

## Project Structure

```
/react-cross-platform
  /packages
    /api - API server for business logic interaction
    /shared - Shared components and logic
    /web - React web application
    /mobile - React Native mobile application
  package.json - Workspace configuration
```

## Setup Instructions

1. Install dependencies:

```bash
# Install yarn if you don't have it
npm install -g yarn

# Install all dependencies
yarn install
```

2. Build the shared package:

```bash
cd packages/shared
yarn build
```

3. Start the api server:

```bash
yarn api
```

4. Start the web application:

```bash
yarn web
```

5. Start the React Native application:

```bash
# For iOS
yarn mobile ios

# For Android
yarn mobile android
```

## Development

When making changes to the shared package, you'll need to rebuild it:

```bash
# In one terminal, watch for changes in the shared package
cd packages/shared
yarn watch

# In another terminal, run your app
yarn web
# or
yarn mobile
```

## Adding Shared Components

To create new shared components:

1. Add your component to `packages/shared/src/components/`
2. Export it in `packages/shared/src/index.ts`
3. Rebuild the shared package with `yarn build`
4. Import and use the component in your web or mobile app

## Notes

- For React Native, you may need to add platform-specific wrappers for shared components
- Keep platform differences in mind when designing shared components
- Consider using a library like `react-native-web` for more seamless component sharing
