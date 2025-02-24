import { openai, createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { type LanguageModel } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.lkeap.cloud.tencent.com/v1",
});

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { Provider } from "../db/schema";

export const myProvider = customProvider({
  imageModels: {
    "small-model": openai.image("dall-e-2"),
    "large-model": openai.image("dall-e-3"),
  },
});

export type CustomLanguageModels = Record<string, LanguageModel>;

export function getMyProvider(dbProviders: Array<Provider>) {
  // 初始化所有provider实例
  const providers = dbProviders.map((provider) => {
    switch (provider.providerType) {
      case "openai":
        return {
          name: provider.providerName,
          instance: createOpenAI({
            apiKey: provider.apiKey || "",
            baseURL: provider.baseUrl,
          }),
          models: provider.models,
        };
      case "deepseek":
        return {
          name: provider.providerName,
          instance: createDeepSeek({
            apiKey: provider.apiKey || "",
            baseURL: provider.baseUrl,
          }),
          models: provider.models,
        };
      default:
        return {
          name: provider.providerName,
          instance: createOpenAI({
            apiKey: provider.apiKey || "",
            baseURL: provider.baseUrl,
          }),
          models: provider.models,
        };
    }
  });

  // 构建复合模型列表
  const languageModels: CustomLanguageModels = providers.reduce(
    (acc, provider) => {
      provider.models?.forEach((model) => {
        const modelKey = `${provider.name}:${model.modelID}`;

        // 特殊处理需要中间件的模型
        if (model.modelID === "deepseek-r1") {
          acc[modelKey] = wrapLanguageModel({
            model: provider.instance(model.modelID),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          });
        } else {
          if (model.aliasModelID) {
            model.aliasModelID.split(",").map((m) => {
              acc[m] = provider.instance(model.modelID);
            })
          }
          acc[modelKey] = provider.instance(model.modelID);
        }
      });
      return acc;
    },
    {} as CustomLanguageModels,
  );

  console.log("languageModels: ", languageModels);
  return customProvider({
    languageModels,
    // 保留原有图片模型配置
    imageModels: {
      "small-model": openai.image("dall-e-2"),
      "large-model": openai.image("dall-e-3"),
    },
  });
}

// 类型扩展声明
declare module "ai" {
  interface CustomProviderLanguageModels extends CustomLanguageModels { }
}
