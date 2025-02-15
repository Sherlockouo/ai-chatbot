import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./ui/dialog";
import { EyeIcon } from "./icons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface MarkdownToImageProps {
  markdown: string;
}

type Template = {
  id: string;
  name: string;
  fontClass: string;
  spacing: { horizontal: number; vertical: number };
  background?: string;
};

export default function MarkdownToImage({ markdown }: MarkdownToImageProps) {
  const [font, setFont] = useState("font-sans");
  const [spacing, setSpacing] = useState({ horizontal: 4, vertical: 4 });
  const [background, setBackground] = useState("#ffffff");
  const [fileName, setFileName] = useState("markdown-export");
  const [fileFormat, setFileFormat] = useState<"png" | "jpeg">("png");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");

  const templates: Template[] = [
    {
      id: "modern",
      name: "Modern",
      fontClass: "font-sans",
      spacing: { horizontal: 8, vertical: 6 },
      background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
    },
    {
      id: "classic",
      name: "Classic",
      fontClass: "font-serif",
      spacing: { horizontal: 6, vertical: 4 },
      background: "#f3f4f6",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      fontClass: "font-mono",
      spacing: { horizontal: 4, vertical: 4 },
      background: "#ffffff",
    },
    {
      id: "custom",
      name: "Custom",
      fontClass: "",
      spacing: { horizontal: 4, vertical: 4 },
    },
  ];

  useEffect(() => {
    if (selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setFont(template.fontClass);
        setSpacing(template.spacing);
        setBackground(template.background || "#ffffff");
      }
    }
  }, [selectedTemplate]);

  const exportRef = useRef<HTMLDivElement>(null);

  const exportToImage = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: null,
      useCORS: true,
      imageTimeout: 0,
      scale: 2, // 提高导出清晰度
    });

    const link = document.createElement("a");
    link.download = `${fileName}.${fileFormat}`;
    link.href = canvas.toDataURL(`image/${fileFormat}`, 1.0);
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="py-1 px-2 h-fit text-muted-foreground"
          variant="outline"
        >
          <EyeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col no-scrollbar">
        <div className="flex-1 overflow-auto">
          <div
            ref={exportRef}
            className={`relative ${font} p-8 rounded-lg mx-auto shadow-lg`}
            style={{
              background,
              padding: `${spacing.vertical}rem ${spacing.horizontal}rem`,
              minWidth: "800px",
              minHeight: "600px",
            }}
          >
            <ReactMarkdown className="prose max-w-none">
              {markdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* 新增控制面板 */}
        <div className="grid grid-cols-2 gap-4 p-4 border-t">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Background</Label>
            <Input
              type="color"
              value={background}
              onChange={(e) => {
                setSelectedTemplate("custom");
                setBackground(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Horizontal Spacing</Label>
            <Input
              type="number"
              value={spacing.horizontal}
              onChange={(e) => {
                setSelectedTemplate("custom");
                setSpacing((prev) => ({
                  ...prev,
                  horizontal: Number(e.target.value),
                }));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Vertical Spacing</Label>
            <Input
              type="number"
              value={spacing.vertical}
              onChange={(e) => {
                setSelectedTemplate("custom");
                setSpacing((prev) => ({
                  ...prev,
                  vertical: Number(e.target.value),
                }));
              }}
            />
          </div>
        </div>

        {/* 导出设置 */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex gap-4">
            <Input
              placeholder="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-48"
            />
            <Select
              value={fileFormat}
              onValueChange={(v: "png" | "jpeg") => setFileFormat(v)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportToImage} className="px-6">
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
