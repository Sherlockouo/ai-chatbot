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

const formSchema = z.object({
  providerName: z
    .string()
    .min(2, "Provider name must be at least 2 characters"),
  providerType: z.string().default("openai"),
  apiKey: z.string().optional(),
  baseUrl: z.string().url("Invalid URL"),
  models: z.array(z.string()).optional(),
});

interface ProviderFormProps {
  initialData?: Provider | null;
  onSuccess: () => void;
}

export function ProviderForm({ initialData, onSuccess }: ProviderFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerName: initialData?.providerName ?? "",
      apiKey: initialData?.apiKey ?? "",
      baseUrl: initialData?.baseUrl ?? "",
      models: initialData?.models ?? [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = initialData
        ? `/api/providers?id=${initialData.id}`
        : "/api/providers";

      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">
            {initialData ? "Save Changes" : "Create Provider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
