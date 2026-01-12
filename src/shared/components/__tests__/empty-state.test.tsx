import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("should render with default title and description", () => {
    render(<EmptyState />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your filters or search query.")
    ).toBeInTheDocument();
  });

  it("should render with custom title", () => {
    render(<EmptyState title="Custom title" />);

    expect(screen.getByText("Custom title")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your filters or search query.")
    ).toBeInTheDocument();
  });

  it("should render with custom description", () => {
    render(<EmptyState description="Custom description" />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("should render with both custom title and description", () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display."
      />
    );

    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(
      screen.getByText("There are no items to display.")
    ).toBeInTheDocument();
  });

  it("should render search icon", () => {
    const { container } = render(<EmptyState />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
