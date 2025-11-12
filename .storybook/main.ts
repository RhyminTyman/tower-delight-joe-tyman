import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import { redwood } from "rwsdk/vite";

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
    config.plugins = config.plugins ?? [];
    config.plugins.push(redwood());
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
      // Mock server-side modules for Storybook
      "@/db": path.resolve(__dirname, "./mocks/db.ts"),
      // Mock all server actions
      "@/app/pages/TowDetail/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/AddTow/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/EditTow/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/EditAddress/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
      "@/app/pages/AddNote/functions": path.resolve(__dirname, "./mocks/serverActions.ts"),
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
