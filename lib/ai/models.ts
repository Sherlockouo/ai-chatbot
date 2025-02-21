import { openai } from "@ai-sdk/openai";
import { fireworks } from "@ai-sdk/fireworks";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.lkeap.cloud.tencent.com/v1",
});

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

export const DEFAULT_CHAT_MODEL: string = "chat-model-large";

export const myProvider = customProvider({
  languageModels: {
    "chat-model-reasoning": wrapLanguageModel({
      model: deepseek("deepseek-r1"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "chat-model-large": deepseek("deepseek-v3"),
    "title-model": deepseek("deepseek-v3"),
    "block-model": deepseek("deepseek-v3"),
  },
  imageModels: {
    "small-model": openai.image("dall-e-2"),
    "large-model": openai.image("dall-e-3"),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model-large",
    name: "Normal Chat",
    description: "Handle daily routines",
  },
  {
    id: "chat-model-reasoning",
    name: "Resoning Model",
    description: "Uses advanced reasoning",
  },
];
