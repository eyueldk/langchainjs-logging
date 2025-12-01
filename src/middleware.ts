import { AIMessage, BaseMessage, createMiddleware } from "langchain";

export interface LoggingMiddlewareOptions {
  log?: (content: string) => string;
  formatMessage?: (message: BaseMessage) => string;
}

export function createLoggingMiddleware(
  options: LoggingMiddlewareOptions = {},
) {
  // Track the last logged message ID
  let lastLoggedMessageId: string | undefined;
  const log = options.log ?? console.log;
  const format = options.formatMessage ?? formatMessage;
  return createMiddleware({
    name: "logging",
    wrapModelCall: async (request, handler) => {
      // Find the index of the last logged message
      let startIndex = 0;
      if (lastLoggedMessageId) {
        const foundIndex = request.messages.findIndex(
          (msg) => msg.id === lastLoggedMessageId,
        );
        if (foundIndex !== -1) {
          // Log all messages after the last logged one
          startIndex = foundIndex + 1;
        } else {
          // If last logged message not found, just log the last message
          startIndex = request.messages.length - 1;
        }
      }

      // Log new messages
      const newMessages = request.messages.slice(startIndex);
      for (const message of newMessages) {
        const formatted = format(message);
        log(truncate(formatted));
        if (message.id) {
          lastLoggedMessageId = message.id;
        }
      }

      // pass request to handler
      const response = await handler(request);

      // Log the response message (AI response)
      const formatted = format(response);
      log(truncate(formatted));
      if (response.id) {
        lastLoggedMessageId = response.id;
      }

      return response;
    },
  });
}

function truncate(content: string, maxLength: number = 500): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "... (truncated)";
}

function formatMessage(message: BaseMessage): string {
  let content =
    typeof message.content === "object"
      ? JSON.stringify(message.content)
      : String(message.content);
  if (message.type === "ai") {
    const aiMessage = message as AIMessage;
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      content = aiMessage.tool_calls.map(call => {
        return `Invoking: '${call.name}' with '${truncate(JSON.stringify(call.args))}'`;
      }).join("\n");
    } else {
    }
    return `[AI]\n${content}\n`;
  } else if (message.type === "human") {
    return `[HUMAN]\n${content}\n`;
  } else if (message.type === "tool") {
    return `[TOOL]\n${content}\n`;
  } else {
    // Fallback for other message types
    return `[${message.type.toUpperCase()}]\n${content}\n`;
  }
}
