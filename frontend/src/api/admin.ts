import { request, requestJson, resolveUrl } from "./client"

// Debug endpoints

export type ResetResult = {
  deleted: number
}

export type GenerateProgress = {
  generated: number
  total: number
}

export type ImportRowError = {
  row: number
  message: string
}

export type ImportResult = {
  processed: number
  created: number
  updated: number
  rejected: number
  errors: ImportRowError[]
  errorsTruncated: number
}

export async function resetUsers(signal?: AbortSignal): Promise<ResetResult> {
  return requestJson<ResetResult>("/admin/users/reset", {
    method: "DELETE",
    signal,
  })
}

type ServerSentEvent = {
  name: string
  payload: GenerateProgress & { message?: string }
}

function parseEvent(chunk: string): ServerSentEvent | null {
  let name = "message"
  const data: string[] = []

  for (const line of chunk.split("\n")) {
    if (line.startsWith("event:")) {
      name = line.slice("event:".length).trim()
    } else if (line.startsWith("data:")) {
      data.push(line.slice("data:".length).trim())
    }
  }

  if (data.length === 0) {
    return null
  }
  return { name, payload: JSON.parse(data.join("\n")) }
}

// SSE stream over POST
export async function generateUsers(
  count: number,
  onProgress: (progress: GenerateProgress) => void,
  signal?: AbortSignal
): Promise<GenerateProgress> {
  const response = await request("/admin/users/generate", {
    method: "POST",
    body: { count },
    signal,
  })

  if (!response.body) {
    throw new Error("The server sent no progress stream.")
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  let latest: GenerateProgress = { generated: 0, total: count }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += value
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const chunk of events) {
      const event = parseEvent(chunk)
      if (!event) {
        continue
      }
      if (event.name === "error") {
        throw new Error(event.payload.message ?? "Generating users failed.")
      }
      latest = {
        generated: event.payload.generated,
        total: event.payload.total,
      }
      onProgress(latest)
    }
  }

  return latest
}

type ImportResultPayload = {
  processed: number
  created: number
  updated: number
  rejected: number
  errors: { row: number; error: string }[]
  errors_truncated: number
}

export async function importUsers(
  file: File,
  signal?: AbortSignal
): Promise<ImportResult> {
  const form = new FormData()
  form.append("file", file)

  const payload = await requestJson<ImportResultPayload>(
    "/admin/users/import",
    { method: "POST", body: form, signal }
  )

  return {
    processed: payload.processed,
    created: payload.created,
    updated: payload.updated,
    rejected: payload.rejected,
    errors: payload.errors.map(({ row, error }) => ({ row, message: error })),
    errorsTruncated: payload.errors_truncated,
  }
}

export const exportUsersUrl = (ids?: string[]) => {
  const params = new URLSearchParams()
  for (const id of ids ?? []) {
    params.append("ids", id)
  }
  const query = params.toString()
  return resolveUrl(`/admin/users/export${query ? `?${query}` : ""}`)
}
