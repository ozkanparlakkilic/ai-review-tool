import { ReactElement } from "react";
import {
  render as rtlRender,
  RenderOptions,
  screen,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import type { Session } from "next-auth";
import { TestWrapper } from "./TestWrapper";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { session?: Session | null }
) => {
  const { session, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper session={session}>{children}</TestWrapper>
  );

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

export {
  customRender as render,
  TestWrapper,
  screen,
  waitFor,
  within,
  cleanup,
};
export { AllTheProviders } from "./testProviders";
