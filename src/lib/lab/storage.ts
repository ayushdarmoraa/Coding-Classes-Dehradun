import {
  isSavedMissionProgress,
  MISSION_STORAGE_KEY,
  type SavedMissionProgress,
} from "./mission";

export type MissionProgressStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type MissionProgressReadResult =
  | { status: "empty" }
  | { status: "loaded"; progress: SavedMissionProgress }
  | { status: "invalid" }
  | { status: "unavailable" };

function getBrowserStorage(): MissionProgressStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadMissionProgress(
  storage: MissionProgressStorage | null = getBrowserStorage(),
): MissionProgressReadResult {
  if (!storage) return { status: "unavailable" };

  let serialized: string | null;
  try {
    serialized = storage.getItem(MISSION_STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (serialized === null) return { status: "empty" };

  try {
    const progress: unknown = JSON.parse(serialized);
    return isSavedMissionProgress(progress)
      ? { status: "loaded", progress }
      : { status: "invalid" };
  } catch {
    return { status: "invalid" };
  }
}

export type MissionProgressWriteResult =
  | { status: "saved" }
  | { status: "cleared" }
  | { status: "invalid" }
  | { status: "unavailable" };

export function saveMissionProgress(
  progress: SavedMissionProgress,
  storage: MissionProgressStorage | null = getBrowserStorage(),
): MissionProgressWriteResult {
  if (!isSavedMissionProgress(progress)) return { status: "invalid" };
  if (!storage) return { status: "unavailable" };

  try {
    storage.setItem(MISSION_STORAGE_KEY, JSON.stringify(progress));
    return { status: "saved" };
  } catch {
    return { status: "unavailable" };
  }
}

export function clearMissionProgress(
  storage: MissionProgressStorage | null = getBrowserStorage(),
): MissionProgressWriteResult {
  if (!storage) return { status: "unavailable" };

  try {
    storage.removeItem(MISSION_STORAGE_KEY);
    return { status: "cleared" };
  } catch {
    return { status: "unavailable" };
  }
}
