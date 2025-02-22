// app/(settings)/providers/page.tsx
"use client";

import { DataTable } from "@/components/data-table";
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
import { fetcher } from "@/lib/utils";
import { CopyIcon, EyeCloseIcon, EyeIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { useCopyToClipboard } from "usehooks-ts";

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
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
      cell: ({ row }) => (
        <motion.div {...animationVariants}>
          {String(row.original.models)}
        </motion.div>
      ),
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
    <div className="p-2 space-y-6 w-full mx-2 flex flex-col">
      <div className="flex justify-between items-center">
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
        className="mx-auto max-w-screen"
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
        <DialogContent className="sm:max-w-[500px] md:max-w-[800px]">
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
