import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueueHeader } from "../queue-header";

describe("QueueHeader", () => {
  it("should render with title and description", () => {
    render(<QueueHeader />);

    expect(screen.getByText("Review Queue")).toBeInTheDocument();
    expect(
      screen.getByText("Review and approve AI-generated outputs")
    ).toBeInTheDocument();
  });

  it("should render title as heading", () => {
    render(<QueueHeader />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Review Queue");
  });
});
