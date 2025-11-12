import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    // DON'T add redwood() plugin - it breaks Storybook by trying to process server actions
    // config.plugins.push(redwood());
    
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
      // Mock server-side modules for Storybook
      "@/db": path.resolve(__dirname, "./mocks/db.ts"),
      // Mock all server actions - need to include .tsx extension for relative imports
      "@/app/pages/TowDetail/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/AddTow/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/EditTow/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/EditAddress/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/AddNote/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      // Also need to handle the actual file paths for relative imports
      [path.resolve(__dirname, "../src/app/pages/TowDetail/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/AddTow/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/EditTow/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/EditAddress/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/AddNote/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
    };
    
    // Externalize Cloudflare Workers modules for Storybook
    config.build = config.build ?? {};
    config.build.rollupOptions = config.build.rollupOptions ?? {};
    config.build.rollupOptions.external = [
      ...(Array.isArray(config.build.rollupOptions.external) ? config.build.rollupOptions.external : []),
      "cloudflare:workers",
      /^node:/,
    ];
    
    return config;
  },
};

export default config;
