import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function createQueryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

export function renderWithQuery(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();
  const Wrapper = createQueryWrapper(queryClient);

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

export async function waitForQueryToFinish(queryClient: QueryClient) {
  await queryClient.getQueryCache().find({ queryKey: [], type: "active" })
    ?.promise;
}
