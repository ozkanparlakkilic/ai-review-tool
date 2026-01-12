import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { vi } from "vitest";

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  } = {}
): NextRequest {
  const { method = "GET", body, headers = {}, searchParams = {} } = options;

  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => urlObj.searchParams.append(key, v));
    } else {
      urlObj.searchParams.set(key, value);
    }
  });

  const requestInit: ConstructorParameters<typeof NextRequest>[1] = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj.toString(), requestInit);
}

export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    user: {
      id: overrides.user?.id ?? "test-user-id",
      email: overrides.user?.email ?? "test@example.com",
      name: overrides.user?.name ?? "Test User",
      role: overrides.user?.role ?? "REVIEWER",
    },
    expires:
      overrides.expires ??
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function createMockAdminSession(
  overrides: Partial<Session> = {}
): Session {
  return createMockSession({
    ...overrides,
    user: {
      id: overrides.user?.id ?? "admin-user-id",
      email: overrides.user?.email ?? "admin@example.com",
      name: overrides.user?.name ?? "Admin User",
      role: "ADMIN",
      ...overrides.user,
    },
  });
}

export async function getResponseJson<T = unknown>(
  response: NextResponse
): Promise<T> {
  const text = await response.text();
  return JSON.parse(text) as T;
}

export function assertStatus(
  response: NextResponse,
  expectedStatus: number
): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}`
    );
  }
}

export async function assertJsonResponse<T = unknown>(
  response: NextResponse,
  expectedStatus: number
): Promise<T> {
  assertStatus(response, expectedStatus);
  return await getResponseJson<T>(response);
}

export function mockAuth(session: Session | null) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { vi } = require("vitest");

  vi.mock("@/server/auth", () => ({
    requireAuth: vi.fn(async (allowedRoles?: string[]) => {
      if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(session.user.role)) {
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
      }

      return session;
    }),
    getServerSession: vi.fn(async () => session),
  }));
}

export function clearAuthMock() {
  vi.unmock("@/server/auth");
}

export interface ApiErrorResponse {
  message: string;
  errors?: unknown[];
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function assertErrorResponse(
  response: NextResponse,
  expectedStatus: number,
  expectedMessage?: string
): Promise<ApiErrorResponse> {
  const data = await assertJsonResponse<ApiErrorResponse>(
    response,
    expectedStatus
  );

  if (expectedMessage && data.message !== expectedMessage) {
    throw new Error(
      `Expected message "${expectedMessage}", got "${data.message}"`
    );
  }

  return data;
}

export async function assertPaginatedResponse<T>(
  response: NextResponse,
  expectedStatus = 200
): Promise<PaginatedResponse<T>> {
  const data = await assertJsonResponse<PaginatedResponse<T>>(
    response,
    expectedStatus
  );

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Response does not contain items array");
  }

  if (!data.meta || typeof data.meta !== "object") {
    throw new Error("Response does not contain meta object");
  }

  return data;
}
