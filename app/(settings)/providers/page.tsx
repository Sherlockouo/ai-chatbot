// app/(settings)/providers/page.tsx
"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ProviderForm } from "./_components/provider-form";
import { useState } from "react";
import { type Provider } from "@/lib/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { fetcher } from "@/lib/utils";
import { EyeCloseIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";

const animationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const ApiKeyCell = ({ apiKey }: { apiKey: string }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const maskedApiKey = apiKey ? "*".repeat(apiKey.length) : "";

  return (
    <motion.div {...animationVariants} className="flex items-center gap-2">
      <span className="font-mono">{showApiKey ? apiKey : maskedApiKey}</span>
      {apiKey && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowApiKey(!showApiKey);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          {showApiKey ? <EyeCloseIcon /> : <EyeCloseIcon />}
        </button>
      )}
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
  console.log("providers ", providers);

  const handleTestConnection = async (configId: string) => {
    try {
      const response = await fetch(`/api/providers/test?id=${configId}`);
      const result = await response.json();

      if (result.valid) {
        toast.success("Connection successful", {
          description: `Found ${result.models.length} models`,
        });
      } else {
        toast.error("Connection failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleDelete = async (deleteId: string) => {
    const deletePromise = fetch(`/api/providers?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {});
        return "Chat deleted successfully";
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
          {(row.original.models as string[])?.join(", ") || "No models"}
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
            variant="outline"
            onClick={() => handleTestConnection(row.original.id)}
          >
            Test
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
        <DialogContent className="sm:max-w-[500px]">
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
