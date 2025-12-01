import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createLoggingMiddleware } from "../src/middleware";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});
const getNameTool = tool(
  async () => {
    return "John Doe";
  },
  {
    name: "getName",
    description: "Get the name of the user",
  },
);
const agent = createAgent({
  model,
  tools: [getNameTool],
  middleware: [createLoggingMiddleware()],
});
await agent.invoke({
  messages: [
    "Hello, how are you?",
    "I want to know the user's name",
    "Can you please help?",
  ],
});
