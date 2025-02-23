import { smoothStream, streamText } from "ai";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { updateDocumentPrompt } from "@/lib/ai/prompts";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, model, dataStream }) => {
    let draftContent = "";
    const { fullStream } = streamText({
      model: model,
      system:
        "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: "text-delta",
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, model, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: model,
      system: updateDocumentPrompt(document.content, "text"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: "content",
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { textDelta } = delta;

        draftContent += textDelta;
        dataStream.writeData({
          type: "text-delta",
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
});
