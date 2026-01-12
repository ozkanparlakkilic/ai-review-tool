import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackForm } from "../feedback-form";

describe("FeedbackForm", () => {
  it("should render with label and textarea", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} />);

    expect(screen.getByText("Feedback (Optional)")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Add notes about this review...")
    ).toBeInTheDocument();
  });

  it("should display current value", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="Test feedback" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText(
      "Add notes about this review..."
    );
    expect(textarea).toHaveValue("Test feedback");
  });

  it("should call onChange when textarea value changes", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText(
      "Add notes about this review..."
    );
    await user.type(textarea, "Test");

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenLastCalledWith("t");
  });

  it("should display error message when error prop is provided", () => {
    const mockOnChange = vi.fn();

    render(
      <FeedbackForm
        value=""
        onChange={mockOnChange}
        error="This field is required"
      />
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should not display error message when error prop is not provided", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} />);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("should disable textarea when disabled prop is true", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} disabled />);

    const textarea = screen.getByPlaceholderText(
      "Add notes about this review..."
    );
    expect(textarea).toBeDisabled();
  });

  it("should not disable textarea when disabled prop is false", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} disabled={false} />);

    const textarea = screen.getByPlaceholderText(
      "Add notes about this review..."
    );
    expect(textarea).not.toBeDisabled();
  });

  it("should have correct textarea attributes", () => {
    const mockOnChange = vi.fn();

    render(<FeedbackForm value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText(
      "Add notes about this review..."
    );
    expect(textarea).toHaveAttribute("id", "feedback");
    expect(textarea).toHaveAttribute("rows", "4");
  });
});
