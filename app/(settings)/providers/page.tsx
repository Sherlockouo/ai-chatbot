// app/(settings)/providers/page.tsx
"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ProviderForm } from "./_components/provider-form";
import { useState } from "react";
import { type Provider } from "@/lib/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { cn, fetcher } from "@/lib/utils";
import { CopyIcon, EyeCloseIcon, EyeIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { useCopyToClipboard } from "usehooks-ts";
import { useSidebar } from "@/components/ui/sidebar";

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const ModelsCell = ({ models }: { models: any[] }) => {
  const displayedModels = models?.slice(0, 2) || [];
  const remainingCount = models?.length - 2 || 0;

  return (
    <motion.div {...animationVariants} className="flex gap-2 flex-col">
      {displayedModels.map((model) => (
        <div key={model.modelID} className="font-mono">
          {model.modelID}
        </div>
      ))}
      {remainingCount > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">+{remainingCount} more</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Available Models</DialogTitle>
            </DialogHeader>
            <motion.div
              {...animationVariants}
              className="grid grid-cols-2 gap-4 p-4"
            >
              {models?.map((model) => (
                <div
                  key={model.modelID}
                  className="font-mono bg-gray-200 rounded-md p-2 break-all"
                >
                  {model.modelID}
                </div>
              ))}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

const ApiKeyCell = ({ apiKey }: { apiKey: string }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const maskedApiKey = apiKey ? "*".repeat(apiKey.length) : "";

  const [_, copyToClipboard] = useCopyToClipboard();
  return (
    <motion.div
      {...animationVariants}
      className="flex items-center gap-2 max-w-[150px]"
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">查看API密钥</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <motion.div
            {...animationVariants}
            className="flex items-center gap-4 p-4"
          >
            <div className="font-mono break-all max-w-[300px] bg-gray-200 rounded-md p-2">
              {showApiKey ? apiKey : maskedApiKey}
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await copyToClipboard(apiKey);
                  toast.success("Content copied to clipboard!");
                }}
              >
                <CopyIcon />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowApiKey(!showApiKey)}
                size="icon"
              >
                {showApiKey ? <EyeCloseIcon /> : <EyeIcon />}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default function ProvidersPage() {
  const { mutate } = useSWRConfig();
  const [selectedConfig, setSelectedConfig] = useState<Provider | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { state } = useSidebar();
  const { data: providers, isLoading } = useSWR<Provider[]>(
    "/api/providers",
    fetcher,
  );


  const handleDelete = async (deleteId: string) => {
    const deletePromise = fetch(`/api/providers?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting provider...",
      success: () => {
        mutate("/api/providers");
        return "deleted successfully";
      },
      error: "Failed to delete chat",
    });
  };

  const columns: ColumnDef<Provider>[] = [
    {
      accessorKey: "providerName",
      header: "Provider",
      cell: ({ row }) => (
        <motion.div {...animationVariants}>
          {row.getValue("providerName")}
        </motion.div>
      ),
    },
    {
      accessorKey: "providerType",
      header: "ProviderType",
      cell: ({ row }) => (
        <motion.div {...animationVariants}>
          {row.getValue("providerType")}
        </motion.div>
      ),
    },
    {
      accessorKey: "baseURL",
      header: "baseURL",
      cell: ({ row }) => (
        <motion.div {...animationVariants}>
          {(row.original.baseUrl as string) || ""}
        </motion.div>
      ),
    },
    {
      accessorKey: "APIKey",
      header: "APIKey",
      cell: ({ row }) => (
        <ApiKeyCell apiKey={(row.original.apiKey as string) || ""} />
      ),
    },
    {
      accessorKey: "models",
      header: "Available Models",
      cell: ({ row }) => <ModelsCell models={row.original.models || []} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <motion.div {...animationVariants} className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedConfig(row.original);
              setShowDialog(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              await handleDelete(row.original.id);
              mutate("/api/providers");
            }}
          >
            Delete
          </Button>
        </motion.div>
      ),
    },
  ];

  return (
    <div className={cn("p-2 space-y-6 w-full max-w-[svw] flex flex-col overflow-scroll", {
      "w-[calc(svw-16rem)]": state === 'expanded',
    })}>
      <div className="w-full flex justify-between items-center">
        <SidebarToggle />
        <h1 className="text-2xl font-bold">Model Providers</h1>
        <Button
          onClick={() => {
            setSelectedConfig(null);
            setShowDialog(true);
          }}
        >
          Add Provider
        </Button>
      </div>

      <motion.div
        className="mx-auto max-w-[calc(svw-var(--sidebar-width))]"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
      >
        <DataTable
          columns={columns}
          data={providers || []}
          isLoading={isLoading}
        />
      </motion.div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[800px] max-h-[60svh] overflow-y-scroll">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <DialogHeader>
              <DialogTitle>
                {selectedConfig ? "Edit Provider" : "New Provider"}
              </DialogTitle>
            </DialogHeader>
            <ProviderForm
              initialData={selectedConfig}
              onSuccess={() => {
                setShowDialog(false);
                mutate("/api/providers");
              }}
            />
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
