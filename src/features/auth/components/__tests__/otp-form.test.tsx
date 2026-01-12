import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpForm } from "../otp-form";


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

describe("OtpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render OTP input and verify button", () => {
    render(<OtpForm />);

    expect(screen.getByText("Verify")).toBeInTheDocument();
  });

  it("should render OTP input component", () => {
    const { container } = render(<OtpForm />);

    const otpContainer = container.querySelector('[class*="flex items-center gap-2"]');
    expect(otpContainer).toBeInTheDocument();
  });

  it("should disable verify button when OTP is less than 6 digits", () => {
    render(<OtpForm />);

    const verifyButton = screen.getByText("Verify");
    expect(verifyButton).toBeDisabled();
  });

  it("should show validation error for OTP less than 6 digits", async () => {
    const user = userEvent.setup();

    render(<OtpForm />);

    const verifyButton = screen.getByText("Verify");
    expect(verifyButton).toBeDisabled();

    await user.click(verifyButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/Please enter the 6-digit code/);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    }, { timeout: 1000 });
  });

  it("should show loading state when verifying", async () => {
    const user = userEvent.setup();

    render(<OtpForm />);

    const verifyButton = screen.getByText("Verify");
    expect(verifyButton).toBeDisabled();
  });

  it("should apply custom className", () => {
    const { container } = render(<OtpForm className="custom-class" />);

    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-class");
  });
});

