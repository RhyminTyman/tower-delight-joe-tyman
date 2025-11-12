// .storybook/mocks/rwsdk-worker.ts
// Mock for rwsdk/worker module which contains server-side types and utilities

// Mock RequestInfo type
export interface RequestInfo {
  ctx?: any;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
}

// Add any other exports from rwsdk/worker that might be needed
export const mockWorkerContext = {
  env: {},
  ctx: {},
};

