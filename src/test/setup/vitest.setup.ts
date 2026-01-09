import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../msw/server";
import {
  mockRouter,
  mockPathname,
  mockSearchParams,
} from "../utils/mockRouter";

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams(),
  useParams: vi.fn(() => ({})),
}));

vi.mock("next-auth/react", async () => {
  const actual =
    await vi.importActual<typeof import("next-auth/react")>("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock("lucide-react", async () => {
  const React = await import("react");
  const actual = await vi.importActual<Record<string, unknown>>("lucide-react");
  const mockIcons: Record<
    string,
    React.ComponentType<React.ComponentProps<"span">>
  > = {};
  Object.keys(actual).forEach((key) => {
    if (key[0] === key[0].toUpperCase()) {
      mockIcons[key] = (props: React.ComponentProps<"span">) =>
        React.createElement("span", props, key);
    }
  });
  return { ...actual, ...mockIcons };
});

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
