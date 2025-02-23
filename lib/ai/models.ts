export const DEFAULT_CHAT_MODEL: string = "deepseek-r1";

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export interface Model {
  nickname: string;
  aliasModelID?: string;
  modelID: string;
  modelProvider: string;
  modelDescription: string;
  modelType: string;
  capabilities: Array<string>;
}

export const processModelData = (data: any[]): Model[] => {
  return data.map((item) => ({
    nickname: item.id,
    aliasModelID: item.aliasModelID,
    modelID: item.id,
    modelProvider: item.owned_by,
    modelDescription: `A model provided by ${item.owned_by}`,
    modelType: item.object,
    capabilities: [], // You can add specific capabilities if available
  }));
};
