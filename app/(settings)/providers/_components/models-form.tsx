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
  const { control, setValue } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={models}
      render={({ field }) => (
        <div>
          <div className="flex items-center justify-between">
            <FormLabel>Models (optional)</FormLabel>
            <div
              className={cx("bg-gray-200 rounded-md p-2 cursor-pointer")}
              onClick={onLoadModels}
            >
              <div className={cx({ "animate-spin": loadingModels })}>
                <ReloadIcon />
              </div>
            </div>
          </div>
          <div>
            {field.value?.map((model: Model, index: number) => (
              <div key={model.modelID} className="flex items-center gap-2 mb-2 outline rounded-md">
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`${name}.${index}.modelID`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="w-full font-medium border rounded px-2 py-1"
                      />
                    )}
                  />
                  <Controller
                    name={`${name}.${index}.aliasModelID`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="alias id for rename title etc."
                        className="w-full font-medium border rounded px-2 py-1"
                      />
                    )}
                  />
                  <Controller
                    name={`${name}.${index}.modelDescription`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="w-full text-sm text-gray-500 border rounded px-2 py-1"
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
};