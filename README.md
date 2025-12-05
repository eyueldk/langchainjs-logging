# langchainjs-logging

LangChain library for capturing and formatting every message that flows through an agent. It keeps track of what has already been logged, truncates large payloads, and lets you plug in your own logger or formatter.

## Installation

```bash
npm install langchainjs-logging langchain
# or
bun install langchainjs-logging langchain
```

## Usage

### Basic

```typescript
import { createAgent } from "langchain";
import { createLoggingMiddleware } from "langchainjs-logging";

const model = someLangChainModel; // supply any LangChain-compatible model

const agent = createAgent({
  model,
  middleware: [createLoggingMiddleware()],
});

await agent.invoke({
  messages: ["Hello! Help me log things."],
});
```

### Advanced

```typescript
const middleware = createLoggingMiddleware({
  log: (content) => {
    console.log("[agent]", content);
    return content; // Return value is stored as last logged string
  },
  formatMessage: (message) =>
    `[${message.type.toUpperCase()}] ${JSON.stringify(message.content)}`,
});

const agent = createAgent({
  model,
  middleware: [middleware],
});
```

## API

### `createLoggingMiddleware(options?)`

Creates a logging component that wraps a LangChain model call and logs new messages before and after the model runs. This function returns a middleware-compatible object that can be used with LangChain's middleware system.

#### Options

- `log?: (content: string) => string` — Custom logger (defaults to `console.log`). Whatever it returns becomes the last logged message string.
- `formatMessage?: (message: BaseMessage) => string` — Custom formatter (defaults to the formatter in [`src/middleware.ts`](src/middleware.ts)).

### Default behavior

- Tracks the ID of the most recently logged message so repeated invocations only log new messages.
- Formats messages by type (`[HUMAN]`, `[AI]`, `[TOOL]`, etc.).
- Shows AI tool calls by listing each invocation and its arguments.
- Truncates large outputs to 500 characters and appends `... (truncated)`.

## Development

```bash
bun install      # Install dependencies
bun start        # Run the playground example (`playground/index.ts`)
bun run build    # Type-check and emit dist files
bun run format   # Format the codebase
```

## License

MIT
