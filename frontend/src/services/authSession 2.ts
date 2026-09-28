import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";
import { AuthSessionSnapshot, PersistedAuthSession, SafeAuthUser } from "@/interfaces/IAuth";
import secureLocalStorage from "react-secure-storage";

type AuthSessionListener = (snapshot: AuthSessionSnapshot | null) => void;
const LEGACY_AUTH_SESSION_STORAGE_KEY = `${USER_TOKEN_STORAGE_KEY}:jwt`;

let accessToken: string | undefined;
let refreshToken: string | undefined;
let sessionId: string | undefined;
let user: SafeAuthUser | undefined;
const listeners = new Set<AuthSessionListener>();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasStringField = (value: Record<string, unknown>, key: string): boolean => {
  return typeof value[key] === "string";
};

const hasOptionalStringField = (value: Record<string, unknown>, key: string): boolean => {
  return value[key] === undefined || typeof value[key] === "string";
};

const isSafeAuthUser = (value: unknown): value is SafeAuthUser => {
  if (!isRecord(value)) return false;

  return hasStringField(value, "_id") && hasStringField(value, "email");
};

const isPersistedAuthSession = (value: unknown): value is PersistedAuthSession => {
  if (!isRecord(value)) return false;

  const isVersionOne = value.version === 1;
  const hasRefreshToken = hasStringField(value, "refreshToken");
  const hasValidSessionId = hasOptionalStringField(value, "sessionId");
  const hasValidUser = value.user === undefined || isSafeAuthUser(value.user);

  return isVersionOne && hasRefreshToken && hasValidSessionId && hasValidUser;
};
const parsePersistedAuthSession = (value: unknown): PersistedAuthSession | null => {
  if (typeof value === "string") {
    try {
      return parsePersistedAuthSession(JSON.parse(value));
    } catch {
      return null;
    }
  }

  const parsedValue = isPersistedAuthSession(value) ? value : null;

  return parsedValue;
};

const removeLegacyLocalStorageSnapshot = () => {
  localStorage.removeItem(LEGACY_AUTH_SESSION_STORAGE_KEY);
};

const getPersistedSnapshot = (): PersistedAuthSession | null => {
  const authSession = secureLocalStorage.getItem(USER_TOKEN_STORAGE_KEY);

  if (authSession) {
    const parsed = parsePersistedAuthSession(authSession);

    return parsed;
  }

  return null;
};

const persistSession = () => {
  if (!refreshToken) {
    removeLegacyLocalStorageSnapshot();
    secureLocalStorage.removeItem(USER_TOKEN_STORAGE_KEY);
    return;
  }

  const session = {
    version: 1,
    refreshToken,
    sessionId,
    user,
  } satisfies PersistedAuthSession;

  removeLegacyLocalStorageSnapshot();
  secureLocalStorage.setItem(USER_TOKEN_STORAGE_KEY, session);
};

const emitAuthSessionChange = () => {
  const snapshot = getAuthSessionSnapshot();

  listeners.forEach((listener) => listener(snapshot));
};

export const loadPersistedAuthSession = () => {
  const persistedSession = getPersistedSnapshot();

  if (!persistedSession) {
    removeLegacyLocalStorageSnapshot();
    return null;
  }

  refreshToken = persistedSession.refreshToken;
  sessionId = persistedSession.sessionId;
  user = persistedSession.user;

  return persistedSession;
};

export const getAuthSessionSnapshot = (): AuthSessionSnapshot | null => {
  if (!refreshToken && !accessToken) {
    return null;
  }

  return {
    version: 1,
    accessToken,
    refreshToken: refreshToken ?? "",
    sessionId,
    user,
  };
};

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => refreshToken;

export const setAuthSession = ({
  nextAccessToken,
  nextRefreshToken,
  nextSessionId,
  nextUser,
}: {
  nextAccessToken?: string;
  nextRefreshToken?: string;
  nextSessionId?: string;
  nextUser?: SafeAuthUser;
}) => {
  accessToken = nextAccessToken ?? accessToken;
  refreshToken = nextRefreshToken ?? refreshToken;
  sessionId = nextSessionId ?? sessionId;
  user = nextUser ?? user;

  persistSession();
  emitAuthSessionChange();
};

export const clearAuthSession = (notify = true) => {
  accessToken = undefined;
  refreshToken = undefined;
  sessionId = undefined;
  user = undefined;
  removeLegacyLocalStorageSnapshot();
  secureLocalStorage.removeItem(USER_TOKEN_STORAGE_KEY);

  if (notify) {
    emitAuthSessionChange();
  }
};

export const subscribeAuthSession = (listener: AuthSessionListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
