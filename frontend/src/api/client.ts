import { Status } from "./types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  [Status.NotFound]: "User no longer exists.",
  [Status.PreconditionFail]: "User has been updated elsewhere.",
  [Status.PreconditionRequired]: "User loaded without a version.",
}

type ValidationDetail = {
  loc: (string | number)[]
  msg: string
}

async function readError(response: Response): Promise<string> {
  const fallback =
    STATUS_MESSAGES[response.status] ??
    `Request failed with status ${response.status}.`

  if (
    response.status === Status.PreconditionFail ||
    response.status === Status.PreconditionRequired
  ) {
    return fallback
  }

  try {
    const { detail } = (await response.json()) as {
      detail?: string | ValidationDetail[]
    }
    if (typeof detail === "string") {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail
        .map(
          ({ loc, msg }) =>
            `${String(loc[loc.length - 1] ?? "request")}: ${msg}`
        )
        .join("; ")
    }
    return fallback
  } catch {
    return fallback
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

export const resolveUrl = (path: string) => `${BASE_URL}${path}`

const isMultipart = (body: unknown) => body instanceof FormData

export async function request(
  path: string,
  { method = "GET", body, headers, signal }: RequestOptions = {}
): Promise<Response> {
  const json = body !== undefined && !isMultipart(body)

  const response = await fetch(resolveUrl(path), {
    method,
    signal,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(body) : (body as BodyInit | undefined),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response))
  }
  return response
}

export async function requestJson<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  return (await request(path, options)).json() as Promise<T>
}

export const describeError = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Something went wrong."

export const isStaleVersionError = (cause: unknown) =>
  cause instanceof ApiError &&
  (cause.status === Status.PreconditionFail ||
    cause.status === Status.PreconditionRequired)
