import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

const ThrowError = ({ message = "Test error" }: { message?: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should catch and display errors", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should show custom fallback UI on error", () => {
    const fallback = <div data-testid="custom-fallback">Custom error</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });

  it("should reset error boundary when reset button is clicked", () => {
    const NormalContent = () => <div>Normal content</div>;
    let shouldThrow = true;

    const ConditionalThrow = () => {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <NormalContent />;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const resetButton = screen.getByText("Try again");
    shouldThrow = false;
    resetButton.click();

    rerender(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should handle different error types", () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Network error" />
      </ErrorBoundary>
    );

    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("should log error in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("should handle multiple error boundaries independently", () => {
    render(
      <ErrorBoundary fallback={<div>Outer error</div>}>
        <div>
          <ErrorBoundary fallback={<div>Inner error</div>}>
            <ThrowError />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Inner error")).toBeInTheDocument();
    expect(screen.queryByText("Outer error")).not.toBeInTheDocument();
  });

  it("should preserve state after reset", () => {
    let shouldThrow = true;

    const ConditionalContent = () => {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>Content after reset</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalContent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const resetButton = screen.getByText("Try again");
    shouldThrow = false;
    resetButton.click();

    rerender(
      <ErrorBoundary>
        <ConditionalContent />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(screen.getByText("Content after reset")).toBeInTheDocument();
  });
});
