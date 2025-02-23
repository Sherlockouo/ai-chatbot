"use server";

import { generateText, LanguageModel, Message } from "ai";
import { cookies } from "next/headers";

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from "@/lib/db/queries";
import { VisibilityType } from "@/components/visibility-selector";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
  model
}: {
  message: Message;
  model: LanguageModel;
}) {
  const { text: title } = await generateText({
    model: model,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

// PLAN: 这就有很多想像空间了，去 fetch 新闻？ 消息推送？让 ai 在后台工作并主动触发一些东西。
// TODO: generate question that user may like 
export async function generateSuggesstionsFromUserMessage({
  message,
  model
}: {
  message: Message;
  model: LanguageModel;
}) {
  const { text: title } = await generateText({
    model: model,
    system: `\n
    - you will generate 4 short questions that user may interested based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the questions should be related to user's message
    - do not use quotes or colons
    - output `,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
