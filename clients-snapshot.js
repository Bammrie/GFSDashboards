const CLIENT_SNAPSHOT_KEY = 'gfs-client-dashboard-snapshot-v1';

function readClientSnapshot() {
  try {
    const raw = window.localStorage.getItem(CLIENT_SNAPSHOT_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw);
    if (!snapshot || !Array.isArray(snapshot.creditUnions)) return null;
    return snapshot;
  } catch {
    return null;
  }
}

function writeClientSnapshot(snapshot) {
  try {
    window.localStorage.setItem(CLIENT_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // The dashboard still works when browser storage is unavailable.
  }
}

window.gfsClientSnapshot = {
  read: readClientSnapshot,
  write: writeClientSnapshot
};
