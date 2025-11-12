// Mock database for Storybook
// This prevents server-side imports from breaking Storybook

export const db = {
  selectFrom: () => ({
    select: () => ({
      where: () => ({
        executeTakeFirst: async () => null,
      }),
    }),
  }),
};

export type DriverDashboardRow = {
  id: string;
  payload: string | object;
};

