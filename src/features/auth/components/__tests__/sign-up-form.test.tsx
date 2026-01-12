import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "../sign-up-form";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("should render social login buttons", () => {
    render(<SignUpForm />);

    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
    });
  });

  it("should show validation error for short password", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "short");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 7 characters long/)).toBeInTheDocument();
    });
  });

  it("should show validation error when passwords don't match", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmPasswordInput, "different123");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/)).toBeInTheDocument();
    });
  });

  it("should accept valid form data", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmPasswordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("should show loading state when submitting", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creating Account...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    }, { timeout: 1000 });
  });

  it("should show success toast after successful submission", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(toast.success).toHaveBeenCalledWith(
          "Account created successfully! Please sign in."
        );
      },
      { timeout: 3000 }
    );
  });

  it("should disable social buttons when loading", async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByText("Create Account");
    await user.click(submitButton);

    await waitFor(() => {
      const githubButton = screen.getByText("GitHub");
      const facebookButton = screen.getByText("Facebook");
      expect(githubButton).toBeDisabled();
      expect(facebookButton).toBeDisabled();
    }, { timeout: 1000 });
  });

  it("should apply custom className", () => {
    const { container } = render(<SignUpForm className="custom-class" />);

    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-class");
  });
});

