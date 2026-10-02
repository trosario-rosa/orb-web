# Orb Web

Administration application for managing users with a clean, working, well-built interface.

## Prerequisites

Make sure the following installed:

- node v24.10.0
- npm v11.6.1

## Installation

Clone the repository and install the project dependencies:

```bash
npm install
```

## Development

Start the development server (with hot module reloading):

```bash
npm run dev
```

The development server will be available at http://localhost:5173.

Run Biome to check the project for lint issues:

```bash
npm run lint
```

Format supported project files with Biome:

```bash
npm run format
```

To check both formatting and lint rules without modifying files:

```bash
npm run check
```

## Production

Run the application in production mode:

```
npm run start
```

The application will be available at http://localhost:8080.

## Testing

Run the test suite:

```bash
npm run test
```

## Project Foundation

This project was bootstrapped using the [Material UI Vite + Tailwind + TypeScript example](https://github.com/mui/material-ui/tree/master/examples/material-ui-vite-tailwind-ts) as a starting point
