"use client";

import { ReloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  const { control, setValue, getValues } = useFormContext();

  const handleAddModel = () => {
    const currentModels = getValues(name) || [];
    setValue(name, [
      ...currentModels,
      { modelID: "", aliasModelID: "", nickname: "", modelDescription: "" },
    ]);
  };
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={models}
      render={({ field }) => (
        <div>
          <div className="flex items-center justify-between">
            <FormLabel>Models (optional)</FormLabel>
            <div className={cx("flex items-center gap-2")}>
              <div
                onClick={onLoadModels}
                className={cx("rounded-md p-3 cursor-pointer ", {
                  "animate-spin": loadingModels,
                })}
              >
                <ReloadIcon />
              </div>
              <Button
                variant={"outline"}
                onClick={handleAddModel}
                className="bg-gray-200 rounded-md p-2 cursor-pointer hover:bg-gray-300"
              >
                Add Model
              </Button>
            </div>
          </div>
          <div>
            {field.value?.map((model: Model, index: number) => (
              <div
                key={model.modelID}
                className="flex items-center gap-2 mb-2 outline rounded-md"
              >
                <div className="flex-1 space-y-1">
                  <Controller
                    name={`${name}.${index}.modelID`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="w-full font-medium border rounded px-2 py-1"
                      />
                    )}
                  />
                  <Controller
                    name={`${name}.${index}.aliasModelID`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="alias id for rename title etc."
                        className="w-full font-medium border rounded px-2 py-1"
                      />
                    )}
                  />
                  <Controller
                    name={`${name}.${index}.nickname`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="nickname for model-select"
                        className="w-full font-medium border rounded px-2 py-1"
                      />
                    )}
                  />
                  <Controller
                    name={`${name}.${index}.modelDescription`}
                    control={control}
                    render={({ field }) => (
                      <Input
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
