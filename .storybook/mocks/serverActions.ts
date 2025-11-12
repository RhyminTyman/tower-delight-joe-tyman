// .storybook/mocks/serverActions.ts
// Comprehensive mocks for all server actions used in the app

// ============================================================================
// AddTow Actions
// ============================================================================

export async function createTow(formData: FormData) {
  console.log('[Mock] createTow called with:', {
    towId: formData.get('towId'),
    ticketId: formData.get('ticketId'),
    vehicle: formData.get('vehicle'),
    driverId: formData.get('driverId'),
  });
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Promise.resolve();
}

// ============================================================================
// EditTow Actions
// ============================================================================

export async function updateTow(formData: FormData) {
  console.log('[Mock] updateTow called with:', {
    towId: formData.get('towId'),
    ticketId: formData.get('ticketId'),
    vehicle: formData.get('vehicle'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Promise.resolve();
}

// ============================================================================
// TowDetail Actions
// ============================================================================

export async function updateTowStatus(formData: FormData) {
  console.log('[Mock] updateTowStatus called with:', {
    towId: formData.get('towId'),
    status: formData.get('status'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Promise.resolve();
}

export async function updateStatus(formData: FormData) {
  console.log('[Mock] updateStatus called with:', {
    towId: formData.get('towId'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Promise.resolve();
}

export async function capturePhoto(formData: FormData) {
  console.log('[Mock] capturePhoto called with:', {
    towId: formData.get('towId'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Promise.resolve();
}

// ============================================================================
// EditAddress Actions
// ============================================================================

export async function updateAddress(formData: FormData) {
  console.log('[Mock] updateAddress called with:', {
    towId: formData.get('towId'),
    addressType: formData.get('addressType'),
    title: formData.get('title'),
    address: formData.get('address'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Promise.resolve();
}

// ============================================================================
// AddNote Actions
// ============================================================================

export async function addNote(formData: FormData) {
  console.log('[Mock] addNote called with:', {
    towId: formData.get('towId'),
    note: formData.get('note'),
  });
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Promise.resolve();
}

