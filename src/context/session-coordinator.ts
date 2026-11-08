export interface RotatedTokenStore {
  setAccessToken(token: string): Promise<void>;
  setRefreshToken(token: string): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  clearAuthTokens(): Promise<void>;
}

export async function persistRotatedTokenPair(
  store: RotatedTokenStore,
  accessToken: string,
  refreshToken: string,
) {
  if (!accessToken || !refreshToken) {
    throw new Error("Both authentication tokens are required.");
  }

  try {
    await store.setAccessToken(accessToken);
    await store.setRefreshToken(refreshToken);

    const [storedAccessToken, storedRefreshToken] = await Promise.all([
      store.getAccessToken(),
      store.getRefreshToken(),
    ]);

    if (
      storedAccessToken !== accessToken ||
      storedRefreshToken !== refreshToken
    ) {
      throw new Error("Rotated authentication tokens could not be verified.");
    }
  } catch (error) {
    try {
      await store.clearAuthTokens();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Rotated tokens could not be persisted or cleared.",
      );
    }

    throw error;
  }
}

export class SessionCoordinator {
  private refreshOperation: Promise<unknown> | null = null;
  private blocked = false;
  private generation = 0;
  private refreshTokenForLogout: string | null = null;
  private logoutPending = false;

  get currentGeneration() {
    return this.generation;
  }

  get isBlocked() {
    return this.blocked;
  }

  get latestRefreshToken() {
    return this.refreshTokenForLogout;
  }

  isGenerationCurrent(generation: number) {
    return !this.blocked && generation === this.generation;
  }

  recordRotatedRefreshToken(token: string) {
    this.refreshTokenForLogout = token;
  }

  clearRefreshTokenForLogout() {
    this.refreshTokenForLogout = null;
    this.logoutPending = false;
  }

  activateSession() {
    this.generation += 1;
    this.blocked = false;
    this.refreshTokenForLogout = null;
    this.logoutPending = false;
  }

  invalidateSession(preserveRefreshToken = false) {
    this.generation += 1;
    this.blocked = true;
    if (!preserveRefreshToken && !this.logoutPending) {
      this.refreshTokenForLogout = null;
    }
  }

  beginLogout() {
    this.logoutPending = true;
    this.invalidateSession(true);
    const refreshOperation = this.refreshOperation;
    return refreshOperation
      ? refreshOperation.then(
          () => undefined,
          () => undefined,
        )
      : Promise.resolve();
  }

  runRefresh<T>(operation: () => Promise<T>): Promise<T> {
    if (this.blocked) {
      return Promise.reject(new Error("The authentication session is inactive."));
    }

    if (!this.refreshOperation) {
      const refreshOperation = Promise.resolve().then(() => {
        if (this.blocked) {
          throw new Error("The authentication session is inactive.");
        }

        return operation();
      });

      this.refreshOperation = refreshOperation;
      const clearRefreshOperation = () => {
        if (this.refreshOperation === refreshOperation) {
          this.refreshOperation = null;
        }
      };
      void refreshOperation.then(clearRefreshOperation, clearRefreshOperation);
    }

    return this.refreshOperation as Promise<T>;
  }
}

export const sessionCoordinator = new SessionCoordinator();
