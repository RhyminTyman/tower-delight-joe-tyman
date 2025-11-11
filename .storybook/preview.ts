import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
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
    layout: "centered",
  },
};

export default preview;