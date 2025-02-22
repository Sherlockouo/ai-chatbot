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

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "tencent-deepseek:deepseek-v3",
    name: "Normal Chat",
    description: "Handle daily routines",
  },
  {
    id: "tencent-deepseek:deepseek-r1",
    name: "Resoning Model",
    description: "Uses advanced reasoning",
  },
];

// 模型类
export interface Model {
  nickname: string;
  modelID: string;
  modelProvider: string;
  modelDescription: string;
  modelType: string;
  capabilities: Array<string>;
}
export const processModelData = (data: any[]): Model[] => {
  return data.map((item) => ({
    nickname: item.id,
    modelID: item.id,
    modelProvider: item.owned_by,
    modelDescription: `A model provided by ${item.owned_by}`,
    modelType: item.object,
    capabilities: [], // You can add specific capabilities if available
  }));
};
