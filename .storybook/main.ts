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
    
    // Add plugin to resolve cloudflare:workers virtual module
    config.plugins = config.plugins ?? [];
    config.plugins.push({
      name: 'mock-cloudflare-workers',
      resolveId(id) {
        if (id === 'cloudflare:workers') {
          return id; // Mark as resolved
        }
      },
      load(id) {
        if (id === 'cloudflare:workers') {
          // Export all common Cloudflare Workers APIs as mocks
          return `
            export const env = {};
            export class DurableObject {}
            export class DurableObjectStub {}
            export class DurableObjectNamespace {}
            export class ExecutionContext {}
            export class Request {}
            export class Response {}
            export class Headers {}
            export class URL {}
            export class URLSearchParams {}
            export default {};
          `;
        }
      }
    });
    
    config.resolve = config.resolve ?? {};
    
    // Add exact match aliases FIRST - order matters!
    const mockAliases = {
      // EXACT file path aliases (must come first for precedence)
      [path.resolve(__dirname, "../src/app/data/driver-dashboard.ts")]: path.resolve(__dirname, "./mocks/driver-dashboard.ts"),
      [path.resolve(__dirname, "../src/db/index.ts")]: path.resolve(__dirname, "./mocks/db.ts"),
      [path.resolve(__dirname, "../src/app/pages/TowDetail/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/AddTow/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/EditTow/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/EditAddress/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
      [path.resolve(__dirname, "../src/app/pages/AddNote/functions.tsx")]: path.resolve(__dirname, "./mocks/serverActions.ts"),
    };
    
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
      // Path-based aliases FIRST (higher priority)
      ...mockAliases,
      // Then @ aliases as fallback
      "@/db": path.resolve(__dirname, "./mocks/db.ts"),
      "@/app/data/driver-dashboard": path.resolve(__dirname, "./mocks/driver-dashboard.ts"),
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
      "rwsdk/db",
      "rwsdk/worker",
      /^node:/,
    ];
    
    // Also configure Vite's optimizeDeps to exclude these
    config.optimizeDeps = config.optimizeDeps ?? {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude ?? []),
      "cloudflare:workers",
      "rwsdk/db",
      "rwsdk/worker",
    ];
    
    return config;
  },
};

export default config;
