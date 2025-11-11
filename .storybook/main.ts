import path from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";
import { redwood } from "rwsdk/vite";

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
  viteFinal: async (baseConfig) => {
    baseConfig.plugins = baseConfig.plugins ?? [];
    baseConfig.plugins.push(redwood());
    baseConfig.resolve = baseConfig.resolve ?? {};
    baseConfig.resolve.alias = {
      ...(baseConfig.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
    };
    return baseConfig;
  },
};

export default config;
import path from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";
import { redwood } from "rwsdk/vite";

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
    };
    return config;
  },
};
export default config;