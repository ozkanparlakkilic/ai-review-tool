import { API_BASE_URL } from "../constants";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function http<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new HttpError(
      response.status,
      errorData.message || `HTTP Error ${response.status}`,
      errorData
    );
  }

  return response.json();
}
