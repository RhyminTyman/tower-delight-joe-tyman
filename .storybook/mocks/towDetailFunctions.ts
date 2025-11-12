// .storybook/mocks/towDetailFunctions.ts
// This file mocks the server actions from TowDetail/functions.tsx for Storybook

export async function updateTowStatus(formData: FormData) {
  // Mock implementation for Storybook
  console.log('[Mock] updateTowStatus called with:', {
    towId: formData.get("towId"),
    status: formData.get("status"),
  });
  
  // Simulate a successful update
  return Promise.resolve();
}

export async function updateStatus(formData: FormData) {
  // Mock implementation for Storybook
  console.log('[Mock] updateStatus called with:', {
    towId: formData.get("towId"),
  });
  
  return Promise.resolve();
}

export async function capturePhoto(formData: FormData) {
  // Mock implementation for Storybook
  console.log('[Mock] capturePhoto called with:', {
    towId: formData.get("towId"),
  });
  
  return Promise.resolve();
}

