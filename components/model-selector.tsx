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

import { CheckCircleFillIcon, ChevronDownIcon, LoaderIcon } from "./icons";
import { Provider } from "@/lib/db/schema";
import useSWR from "swr";
import { Skeleton } from "./ui/skeleton";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  // 使用SWR获取providers数据
  const { data: providers } = useSWR<Provider[]>("/api/providers", fetcher, {
    fallbackData: [],
  });

  // 转换providers数据为chatModels格式
  const dynamicChatModels = useMemo(() => {
    if (!providers) return [];
    return providers.flatMap((provider: Provider) =>
      (provider.models || []).map((model) => {
        // const model = JSON.parse(String(m));
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
          {selectedChatModel?.name || (
            <div className="flex items-center gap-2">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <Skeleton className="size-16 h-6 rounded-md" />
            </div>
          )}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[300px] max-h-[60svh] overflow-y-scroll no-scrollbar"
      >
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
