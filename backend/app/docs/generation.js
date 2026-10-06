/* Swagger UI's execute wrapper is pinned to the version in index.html. */
const GENERATE_OPERATION = { path: "/admin/users/generate", method: "post" };
const GENERATION_EVENTS = ["progress", "complete", "error"];
const IDLE_STATE = { phase: "idle", generated: 0, total: 0, message: "" };
const MESSAGES = {
  invalidBody: "Enter valid JSON in the request body.",
  connecting: "Connecting…",
  generating: "Generating users…",
  complete: "Generation complete.",
  failed: "Generation failed.",
  noStream: "The server did not return a progress stream.",
  invalidProgress: "The server returned invalid progress data.",
  disconnected:
    "Connection ended before completion. The last confirmed count is shown; saved users remain.",
  cancelled:
    "Stopped. The last confirmed count is shown; a batch already running may still be saved.",
};

function sseField(lines, name) {
  const prefix = `${name}:`;
  return lines
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trimStart());
}

/* Yields each server-sent event in a response body as { event, data }. */
async function* readServerSentEvents(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      // A network chunk may split an event or contain several events.
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const lines = buffer.slice(0, boundary.index).split(/\r?\n/);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        yield {
          event: sseField(lines, "event")[0]?.trim(),
          data: sseField(lines, "data").join("\n"),
        };
      }
      if (done) return;
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

async function errorDetail(response) {
  const { detail } = await response.json().catch(() => ({}));
  const text = Array.isArray(detail)
    ? detail.map((item) => `${item.loc.join(".")}: ${item.msg}`).join("; ")
    : detail;
  return text || `Request failed (HTTP ${response.status}).`;
}

/* Starts a generation run and yields its { event, generated, total, message } updates. */
async function* streamGeneration(body, signal) {
  const response = await fetch(
    new URL(`.${GENERATE_OPERATION.path}`, window.location.href),
    {
      method: GENERATE_OPERATION.method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
      signal,
    },
  );
  if (!response.ok) throw new Error(await errorDetail(response));
  if (
    !response.headers.get("content-type")?.includes("text/event-stream") ||
    !response.body
  ) {
    throw new Error(MESSAGES.noStream);
  }

  for await (const { event, data } of readServerSentEvents(response.body)) {
    if (!GENERATION_EVENTS.includes(event)) continue;
    const update = JSON.parse(data);
    if (!Number.isFinite(update.generated) || !Number.isFinite(update.total)) {
      throw new Error(MESSAGES.invalidProgress);
    }
    yield { ...update, event };
  }
}

function GenerationProgressPlugin(system) {
  const React = system.React;
  const el = React.createElement;
  const format = (value) => value.toLocaleString();

  class GenerationExecute extends React.Component {
    state = IDLE_STATE;
    controller = null;
    mounted = true;

    componentWillUnmount() {
      this.mounted = false;
      this.controller?.abort();
    }

    update(state) {
      if (this.mounted) this.setState(state);
    }

    requestBody() {
      const raw = this.props.oas3Selectors.requestBodyValue(
        this.props.path,
        this.props.method,
      );
      return typeof raw === "string" ? JSON.parse(raw) : (raw?.toJS?.() ?? raw);
    }

    execute = async () => {
      if (this.controller) return;
      let body;
      try {
        body = this.requestBody();
      } catch {
        this.update({
          ...IDLE_STATE,
          phase: "error",
          message: MESSAGES.invalidBody,
        });
        return;
      }

      const controller = new AbortController();
      this.controller = controller;
      this.update({
        ...IDLE_STATE,
        phase: "running",
        message: MESSAGES.connecting,
      });
      try {
        for await (const {
          event,
          generated,
          total,
          message,
        } of streamGeneration(body, controller.signal)) {
          this.update({ generated, total });
          if (event === "error") throw new Error(message || MESSAGES.failed);
          if (event === "complete") {
            this.update({ phase: "complete", message: MESSAGES.complete });
            return;
          }
          this.update({ message: MESSAGES.generating });
        }
        throw new Error(MESSAGES.disconnected);
      } catch (error) {
        this.update(
          controller.signal.aborted
            ? { phase: "cancelled", message: MESSAGES.cancelled }
            : { phase: "error", message: error.message },
        );
      } finally {
        this.controller = null;
      }
    };

    stop = () => this.controller?.abort();

    renderButtons(running) {
      return el(
        "div",
        { className: "generation-buttons" },
        el(
          "button",
          {
            type: "button",
            className: "btn execute opblock-control__btn",
            disabled: running || this.props.disabled,
            onClick: this.execute,
          },
          running ? "Generating…" : "Execute",
        ),
        running &&
          el(
            "button",
            { type: "button", className: "btn", onClick: this.stop },
            "Stop generation",
          ),
      );
    }

    renderStatus() {
      const { phase, generated, total, message } = this.state;
      return el(
        "div",
        {
          className: "generation-status",
          "data-phase": phase,
          role: "status",
          "aria-live": "polite",
        },
        total > 0 &&
          el(
            "strong",
            null,
            `${format(generated)} / ${format(total)} generated`,
          ),
        total > 0 &&
          el("progress", {
            max: total,
            value: generated,
            "aria-label": "Users generated",
          }),
        el("p", null, message),
      );
    }

    render() {
      const { phase } = this.state;
      return el(
        "div",
        { className: "generation-controls" },
        this.renderButtons(phase === "running"),
        phase !== "idle" && this.renderStatus(),
      );
    }
  }

  const isGenerateOperation = ({ path, method }) =>
    path === GENERATE_OPERATION.path && method === GENERATE_OPERATION.method;

  return {
    wrapComponents: {
      execute: (Original) => (props) =>
        el(isGenerateOperation(props) ? GenerationExecute : Original, props),
    },
  };
}

window.ui = SwaggerUIBundle({
  url: "./openapi.json",
  dom_id: "#swagger-ui",
  layout: "BaseLayout",
  deepLinking: true,
  showExtensions: true,
  showCommonExtensions: true,
  presets: [SwaggerUIBundle.presets.apis],
  plugins: [GenerationProgressPlugin],
});
