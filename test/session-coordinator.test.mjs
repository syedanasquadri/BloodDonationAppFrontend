import assert from "node:assert/strict";
import { test } from "node:test";
import {
  persistRotatedTokenPair,
  SessionCoordinator,
} from "../src/context/session-coordinator.ts";

test("failed persistence after rotation clears the old token pair", async () => {
  const coordinator = new SessionCoordinator();
  const tokens = {
    accessToken: "old-access",
    refreshToken: "old-refresh",
  };
  const store = {
    async setAccessToken(token) {
      tokens.accessToken = token;
    },
    async setRefreshToken() {
      throw new Error("SecureStore write failed");
    },
    async getAccessToken() {
      return tokens.accessToken;
    },
    async getRefreshToken() {
      return tokens.refreshToken;
    },
    async clearAuthTokens() {
      tokens.accessToken = null;
      tokens.refreshToken = null;
    },
  };

  coordinator.recordRotatedRefreshToken("new-refresh");
  try {
    await persistRotatedTokenPair(store, "new-access", "new-refresh");
    assert.fail("Expected token persistence to fail.");
  } catch (error) {
    coordinator.invalidateSession(true);
    assert.match(error.message, /SecureStore write failed/);
  }

  assert.deepEqual(tokens, { accessToken: null, refreshToken: null });
  assert.equal(coordinator.isBlocked, true);
  assert.equal(coordinator.latestRefreshToken, "new-refresh");
});

test("successful rotation persists both replacement tokens", async () => {
  const tokens = {
    accessToken: "old-access",
    refreshToken: "old-refresh",
  };
  const store = {
    async setAccessToken(token) {
      tokens.accessToken = token;
    },
    async setRefreshToken(token) {
      tokens.refreshToken = token;
    },
    async getAccessToken() {
      return tokens.accessToken;
    },
    async getRefreshToken() {
      return tokens.refreshToken;
    },
    async clearAuthTokens() {
      tokens.accessToken = null;
      tokens.refreshToken = null;
    },
  };

  await persistRotatedTokenPair(store, "new-access", "new-refresh");
  assert.deepEqual(tokens, {
    accessToken: "new-access",
    refreshToken: "new-refresh",
  });
});

test("a failed refresh operation alone does not invalidate stored credentials", async () => {
  const coordinator = new SessionCoordinator();
  const tokens = { accessToken: "access", refreshToken: "refresh" };

  await assert.rejects(
    coordinator.runRefresh(async () => {
      throw new Error("network unavailable");
    }),
    /network unavailable/,
  );

  assert.deepEqual(tokens, { accessToken: "access", refreshToken: "refresh" });
  assert.equal(coordinator.isBlocked, false);
});

test("ordinary invalidation clears a retained rotated refresh token", () => {
  const coordinator = new SessionCoordinator();
  coordinator.recordRotatedRefreshToken("rotated-refresh");

  coordinator.invalidateSession();

  assert.equal(coordinator.latestRefreshToken, null);
  assert.equal(coordinator.isGenerationCurrent(0), false);
});

test("logout waits for rotation and blocks new refresh operations", async () => {
  const coordinator = new SessionCoordinator();
  let latestRefreshToken = "old-refresh";
  let completeRotation;

  const refreshOperation = coordinator.runRefresh(
    () =>
      new Promise((resolve) => {
        completeRotation = () => {
          latestRefreshToken = "rotated-refresh";
          coordinator.recordRotatedRefreshToken(latestRefreshToken);
          resolve(latestRefreshToken);
        };
      }),
  );

  await new Promise((resolve) => setImmediate(resolve));
  const logoutBarrier = coordinator.beginLogout();
  assert.equal(coordinator.isBlocked, true);
  await assert.rejects(
    coordinator.runRefresh(async () => "unexpected"),
    /session is inactive/,
  );

  completeRotation();
  await Promise.all([refreshOperation, logoutBarrier]);

  assert.equal(latestRefreshToken, "rotated-refresh");
  assert.equal(coordinator.latestRefreshToken, "rotated-refresh");
  coordinator.clearRefreshTokenForLogout();
  assert.equal(coordinator.latestRefreshToken, null);
});

test("concurrent callers share one refresh operation", async () => {
  const coordinator = new SessionCoordinator();
  let operationCount = 0;
  let releaseRefresh;
  const operation = () => {
    operationCount += 1;
    return new Promise((resolve) => {
      releaseRefresh = () => resolve("rotated");
    });
  };

  const first = coordinator.runRefresh(operation);
  const second = coordinator.runRefresh(operation);
  await new Promise((resolve) => setImmediate(resolve));
  releaseRefresh();

  assert.deepEqual(await Promise.all([first, second]), ["rotated", "rotated"]);
  assert.equal(operationCount, 1);
});

test("logout invalidates the generation of an in-flight protected request", async () => {
  const coordinator = new SessionCoordinator();
  const requestGeneration = coordinator.currentGeneration;
  const refreshOperation = coordinator.runRefresh(
    () => new Promise((resolve) => setTimeout(() => resolve("rotated"), 0)),
  );

  await new Promise((resolve) => setImmediate(resolve));
  await coordinator.beginLogout();
  await refreshOperation;

  assert.notEqual(requestGeneration, coordinator.currentGeneration);
  assert.equal(coordinator.isBlocked, true);
});
