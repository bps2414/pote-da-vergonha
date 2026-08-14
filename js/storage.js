// Storage & API Sync Layer
// Handles offline-first LocalStorage and Vercel Serverless Sync

const STORAGE_KEY = 'pote_da_vergonha_state_v1';

export const storage = {
  loadLocalState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load local state:', e);
      return null;
    }
  },

  saveLocalState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save local state:', e);
    }
  },

  async syncWithServer(roomCode, roomState) {
    if (!roomCode) return roomState;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC',
          code: roomCode,
          room: roomState
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.room || roomState;
      }
    } catch (e) {
      console.warn('Network sync offline fallback:', e);
    }
    return roomState;
  },

  async fetchRoom(roomCode) {
    try {
      const res = await fetch(`/api/rooms?code=${encodeURIComponent(roomCode)}`);
      if (res.ok) {
        const data = await res.json();
        return data.room;
      }
    } catch (e) {
      console.warn('Could not fetch room from server:', e);
    }
    return null;
  }
};
