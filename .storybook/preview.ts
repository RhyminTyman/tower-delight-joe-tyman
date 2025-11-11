import "../src/styles/globals.css";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "night-operations",
      values: [
        { name: "night-operations", value: "#050B16" },
        { name: "daylight", value: "#F7FBFF" },
      ],
    },
  },
};

export default preview;

