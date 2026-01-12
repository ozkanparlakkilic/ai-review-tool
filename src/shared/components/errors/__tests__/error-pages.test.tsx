import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeneralError } from "../general-error";
import { NotFoundError } from "../not-found-error";
import { UnauthorizedError } from "../unauthorized-error";
import { ForbiddenError } from "../forbidden-error";
import { MaintenanceError } from "../maintenance-error";

const mockRouter = {
  back: vi.fn(),
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("Error Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GeneralError", () => {
    it("should render with default layout", () => {
      render(<GeneralError />);

      expect(screen.getByText("500")).toBeInTheDocument();
      expect(
        screen.getByText(/Oops! Something went wrong/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We apologize for the inconvenience/)
      ).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
    });

    it("should render minimal version without header and buttons", () => {
      render(<GeneralError minimal />);

      expect(screen.queryByText("500")).not.toBeInTheDocument();
      expect(
        screen.getByText(/Oops! Something went wrong/)
      ).toBeInTheDocument();
      expect(screen.queryByText("Go Back")).not.toBeInTheDocument();
      expect(screen.queryByText("Back to Home")).not.toBeInTheDocument();
    });

    it("should call router.back when Go Back button is clicked", () => {
      render(<GeneralError />);

      const goBackButton = screen.getByText("Go Back");
      goBackButton.click();

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("should call router.push with '/' when Back to Home button is clicked", () => {
      render(<GeneralError />);

      const homeButton = screen.getByText("Back to Home");
      homeButton.click();

      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });

    it("should apply custom className", () => {
      const { container } = render(<GeneralError className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("NotFoundError", () => {
    it("should render with correct content", () => {
      render(<NotFoundError />);

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Oops! Page Not Found!")).toBeInTheDocument();
      expect(
        screen.getByText(/It seems like the page you're looking for/)
      ).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
    });

    it("should call router.back when Go Back button is clicked", () => {
      render(<NotFoundError />);

      const goBackButton = screen.getByText("Go Back");
      goBackButton.click();

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("should call router.push with '/' when Back to Home button is clicked", () => {
      render(<NotFoundError />);

      const homeButton = screen.getByText("Back to Home");
      homeButton.click();

      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });
  });

  describe("UnauthorizedError", () => {
    it("should render with correct content", () => {
      render(<UnauthorizedError />);

      expect(screen.getByText("401")).toBeInTheDocument();
      expect(screen.getByText("Unauthorized Access")).toBeInTheDocument();
      expect(
        screen.getByText(/Please log in with the appropriate credentials/)
      ).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("should call router.back when Go Back button is clicked", () => {
      render(<UnauthorizedError />);

      const goBackButton = screen.getByText("Go Back");
      goBackButton.click();

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("should call router.push with '/login' when Sign In button is clicked", () => {
      render(<UnauthorizedError />);

      const signInButton = screen.getByText("Sign In");
      signInButton.click();

      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("ForbiddenError", () => {
    it("should render with correct content", () => {
      render(<ForbiddenError />);

      expect(screen.getByText("403")).toBeInTheDocument();
      expect(screen.getByText("Access Forbidden")).toBeInTheDocument();
      expect(
        screen.getByText(/You don't have necessary permission/)
      ).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
    });

    it("should call router.back when Go Back button is clicked", () => {
      render(<ForbiddenError />);

      const goBackButton = screen.getByText("Go Back");
      goBackButton.click();

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("should call router.push with '/' when Back to Home button is clicked", () => {
      render(<ForbiddenError />);

      const homeButton = screen.getByText("Back to Home");
      homeButton.click();

      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });
  });

  describe("MaintenanceError", () => {
    it("should render with correct content", () => {
      render(<MaintenanceError />);

      expect(screen.getByText("503")).toBeInTheDocument();
      expect(
        screen.getByText("Website is under maintenance!")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The site is not available at the moment/)
      ).toBeInTheDocument();
    });
  });
});
