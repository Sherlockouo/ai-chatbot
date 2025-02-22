"use client";

import { ReloadIcon } from "@/components/icons";
import { FormLabel } from "@/components/ui/form";
import { Model } from "@/lib/ai/models";
import { cx } from "class-variance-authority";
import { useFormContext, Controller } from "react-hook-form";

interface ModelsFieldProps {
  name: string;
  models: Model[];
  loadingModels: boolean;
  onLoadModels: () => void;
}

export const ModelsField: React.FC<ModelsFieldProps> = ({
  name,
  models,
  loadingModels,
  onLoadModels,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <div className="flex items-center justify-between">
            <FormLabel>Models (optional)</FormLabel>
            <div
              className={cx("bg-gray-200 rounded-md p-2 cursor-pointer")}
              onClick={onLoadModels}
            >
              <div
                className={cx({
                  "animate-spin": loadingModels,
                })}
              >
                <ReloadIcon />
              </div>
            </div>
          </div>
          <div>
            {models.map((model: Model) => (
              <div key={model.modelID} className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <div className="font-medium">{model.modelID}</div>
                  <div className="text-sm text-gray-500">
                    {model.modelDescription}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
};
