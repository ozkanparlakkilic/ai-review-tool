import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "../forgot-password-form";


vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRouter = {
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email input and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("reviewer@test.com")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("reviewer@test.com");
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByText("Continue");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
    });
  });

  it("should accept valid email", async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("reviewer@test.com");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should show loading state when submitting", async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("reviewer@test.com");
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByText("Continue");
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    }, { timeout: 1000 });
  });

  it("should navigate to /otp after successful submission", async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("reviewer@test.com");
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByText("Continue");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith("/otp");
      },
      { timeout: 3000 }
    );
  });

  it("should show success toast after submission", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("reviewer@test.com");
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByText("Continue");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(toast.success).toHaveBeenCalledWith("Reset link sent to test@example.com");
      },
      { timeout: 3000 }
    );
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ForgotPasswordForm className="custom-class" />
    );

    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-class");
  });
});

