## Experience

### Professional work

At my previous employer, use of AI for programming was restricted due to the sensitivity of the software.

I was tasked with research and integration of local large language models into our GIS software.

- Investigated model capabilities
  - At the time, llama 3.1 was the most capable edge model available
- Put together an ollama microservice
- Built a custom chat interface into the GIS software, following design standards
- Wrote up a way for the model to access map context, API endpoints and actions
- Implemented advanced chat capabilities that dynamically rendered custom components through output triggers
  (LaTeX rendering, Mermaid charts, Markdown rendering, Embeddable media)

### Local Models

I have run and experimented with the following models with ollama:

- llama 3.1 and 3.2
- Granite 8b
- gemma 4 26b
- Qwen 9b, 27b

I built an ai homelab with two rtx 3090s to keep up to date with the local model improvements.

Have tried local image and video generation, its already at a capable spot but that scene doesn't
really pique my interest.

### Cloud Models

I use the following cloud models:

- Claude Max (x20)
- Github Copilot Plus
- ChatGPT Plus
- Gemini Plus

### Harness

I have used the following harnesses:

- OpenCode
- Codex
- Claude Code
- VS Code
- Openclaw

### Favorite Use of AI

GitKraken's AI integration has been the one I have found to be the most

- The commit message generation is great after tweaking instruction to follow standards
- Used the context-aware merge conflict resolution a few times and it was also pretty good

## AI Use in this project

> You may use AI as a reference, but please describe how you used it in your README. The code you submit should be your own work; do not use AI to generate the project.

I've turned off next line suggestion and any other AI features in my IDE

My use of AI in this project will be restricted to reference

| Search                                               | Reason                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Enforce LF line ending git                           | Forgot how it was done. My primary desktop is Windows and my dev laptop is Ubuntu so I usually do this when starting a new project. |
| Typescript 7 eslint/prettier issues and alternatives | Wanted to try out typescript 7 for this project but my usual setup was unsupported                                                  |
| frameworks for WCAG accessibility coverage testing   | Was interested in seeing what accessibility test automation existed, even if it doesnt cover all cases. Also looked into latest playwright testing framework convention |
