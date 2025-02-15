"use client";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import React from "react";

// 按需导入语言语法
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import rust from "react-syntax-highlighter/dist/cjs/languages/prism/rust";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import java from "react-syntax-highlighter/dist/cjs/languages/prism/java";
import c from "react-syntax-highlighter/dist/cjs/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/cjs/languages/prism/cpp";
import sql from "react-syntax-highlighter/dist/cjs/languages/prism/sql";

// 导入主题
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

// 创建语言注册表
const languageMap = {
  rust,
  tsx,
  typescript,
  javascript,
  css,
  scss,
  json,
  markdown,
  bash,
  python,
  java,
  c,
  cpp,
  sql,
  // 添加别名映射
  js: javascript,
  ts: typescript,
  shell: bash,
  sh: bash,
};

// 注册所有语言
Object.entries(languageMap).forEach(([lang, loader]) => {
  SyntaxHighlighter.registerLanguage(lang, loader);
});

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1].toLowerCase() : "";
  const isDarkMode = true; // 替换为你的主题状态

  if (!inline) {
    return (
      <div className="not-prose flex flex-col relative">
        {lang && (
          <div className="absolute right-4 top-2 text-xs text-zinc-400 dark:text-zinc-500">
            {lang}
          </div>
        )}
        <SyntaxHighlighter
          language={lang in languageMap ? lang : "text"}
          style={isDarkMode ? oneDark : oneLight}
          PreTag="div"
          customStyle={{
            fontSize: "0.875rem",
            margin: 0,
            padding: "1rem",
          }}
          codeTagProps={{
            className: "whitespace-pre-wrap break-words font-mono",
          }}
          className={`w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md font-mono`}
      {...props}
    >
      {children}
    </code>
  );
}
