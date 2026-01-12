import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryProvider } from "../query-provider";
import { useQueryClient, QueryClient } from "@tanstack/react-query";

vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));

describe("QueryProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <QueryProvider>
        <div>Test content</div>
      </QueryProvider>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should provide QueryClient to children", () => {
    const queryClients: QueryClient[] = [];

    const TestChild = () => {
      const queryClient = useQueryClient();
      queryClients.push(queryClient);
      return <div data-testid="has-query-client">Test</div>;
    };

    render(
      <QueryProvider>
        <TestChild />
      </QueryProvider>
    );

    expect(screen.getByTestId("has-query-client")).toBeInTheDocument();
    expect(queryClients[0]).toBeInstanceOf(QueryClient);
  });

  it("should render multiple children", () => {
    render(
      <QueryProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </QueryProvider>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
