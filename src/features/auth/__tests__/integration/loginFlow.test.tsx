import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@/test/utils/render";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import LoginPage from "@app/login/page";
import userEvent from "@testing-library/user-event";
import { mockRouter } from "@/test/utils/mockRouter";

describe("loginFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("login success redirects to home", async () => {
    const user = userEvent.setup();

    vi.mocked(signIn).mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: null,
    } as any);

    render(<LoginPage />, { session: null });

    const emailInput = screen.getByPlaceholderText(/reviewer@test.com/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "reviewer@test.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "reviewer@test.com",
        password: "password123",
        redirect: false,
        callbackUrl: "/",
      });
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });
  });

  it("login error calls signIn with error", async () => {
    const user = userEvent.setup();

    vi.mocked(signIn).mockResolvedValue({
      error: "CredentialsSignin",
      status: 401,
      ok: false,
      url: null,
    } as any);

    const { container } = render(<LoginPage />, { session: null });

    const emailInputs = container.querySelectorAll(
      'input[type="email"], input[placeholder*="reviewer" i]'
    );
    const emailInput = emailInputs[0] as HTMLInputElement;
    if (!emailInput) throw new Error("Email input not found");

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "wrong@test.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "wrong@test.com",
        password: "wrongpassword",
        redirect: false,
        callbackUrl: "/",
      });
    });
  });
});
