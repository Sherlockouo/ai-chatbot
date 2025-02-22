"use client";

import { startTransition, useMemo, useOptimistic, useState } from "react";

import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatModel } from "@/lib/ai/models";
import { cn, fetcher } from "@/lib/utils";

import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";
import { Provider } from "@/lib/db/schema";
import useSWR from "swr";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  // TODO: chat models 通过 fetch api/providers 接口获取,需要用SWR，并把响应结果转换为 chatModels 数组, 默认模型为第一个
  // 使用SWR获取providers数据
  const { data: providers } = useSWR<Provider[]>("/api/providers", fetcher, {
    fallbackData: [],
  });

  // 转换providers数据为chatModels格式
  const dynamicChatModels = useMemo(() => {
    if (!providers) return [];
    return providers.flatMap((provider: Provider) =>
      (provider.models || []).map((m) => {
        const model = JSON.parse(String(m));
        return {
          id: `${provider.providerName}:${model.modelID}`,
          name: model.nickname,
          description: model.modelDescription || "",
        };
      }),
    );
  }, [providers]);

  // 使用第一个模型作为默认值
  const defaultModelId = dynamicChatModels[0]?.id || "";
  const finalSelectedId = optimisticModelId || defaultModelId;

  const selectedChatModel = useMemo(
    () =>
      dynamicChatModels.find(
        (model: ChatModel) => model.id === finalSelectedId,
      ),
    [dynamicChatModels, finalSelectedId],
  );

  // 处理加载状态
  if (!providers) return <div>Loading models...</div>;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className,
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {dynamicChatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              className="gap-4 group/item flex flex-row justify-between items-center"
              data-active={id === optimisticModelId}
            >
              <div className="flex flex-col gap-1 items-start">
                <div>{chatModel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {chatModel.description}
                </div>
              </div>

              <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                <CheckCircleFillIcon />
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
