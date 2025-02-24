"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Provider } from "@/lib/db/schema";
import { useState } from "react";
import { Model, processModelData } from "@/lib/ai/models";
import { ModelsField } from "./models-form";
// 使用 Zod 创建模型验证
const ModelSchema = z.object({
  nickname: z.string(),
  modelID: z.string(),
  modelProvider: z.string(),
  modelDescription: z.string(),
  modelType: z.string(),
  capabilities: z.array(z.string()),
});

const formSchema = z.object({
  providerName: z
    .string()
    .min(2, "Provider name must be at least 2 characters"),
  providerType: z.string().default("openai"),
  apiKey: z.string().optional(),
  baseUrl: z.string().url("Invalid URL"),
  models: z.array(ModelSchema).optional(),
});

interface ProviderFormProps {
  initialData?: Provider | null;
  onSuccess: () => void;
}

export function ProviderForm({ initialData, onSuccess }: ProviderFormProps) {
  const [loadingModels, setLoadingModels] = useState(false);
  const [models, setModels] = useState<Model[]>(initialData?.models || []);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerName: initialData?.providerName ?? "",
      providerType: initialData?.providerType ?? "openai",
      apiKey: initialData?.apiKey ?? "",
      baseUrl: initialData?.baseUrl ?? "",
      models: initialData?.models ?? [],
    },
  });
  const handleLoadModels = async () => {
    setLoadingModels(true);
    // 获取表单中的baseUrl和apiKey
    const { baseUrl, apiKey } = form.getValues();
    // 拼接API路径并移除可能的双斜杠
    const u = new URL(baseUrl)
    const apiUrl = `${u.origin}/v1/models`;

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiUrl, // 使用表单中的baseUrl
          apiKey, // 使用表单中的apiKey
        }),
      });

      if (!response.ok) throw new Error("Failed to load models");
      const modelsResp = await response.json();
      const models = processModelData(modelsResp.data);
      setModels(models);
      form.setValue("models", models);
    } catch (error) {
      toast.error("Failed to load models");
    } finally {
      setLoadingModels(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = initialData
        ? `/api/providers?id=${initialData.id}`
        : "/api/providers";

      const response = await fetch(url, {
        method: initialData?.id ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Submission failed");

      onSuccess();
    } catch (error) {
      toast(String(error));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={async () => {
          await onSubmit(form.getValues());
        }}
        className="space-y-4 mt-4"
      >
        <FormField
          control={form.control}
          name="providerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input placeholder="OpenAI" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Type</FormLabel>
              <FormControl>
                <Input placeholder="Deepseek" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="sk-..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://api.openai.com/v1"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ModelsField
          name="models"
          models={models}
          loadingModels={loadingModels}
          onLoadModels={handleLoadModels}
        />

        <div className="flex justify-end gap-2 pt-4 select-none cursor-pointer">
          <Button type="submit">
            {initialData ? "Save Changes" : "Create Provider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
