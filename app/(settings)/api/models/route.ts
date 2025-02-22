import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 从请求体获取参数
    const { apiUrl, apiKey } = await request.json();

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing API parameters" },
        { status: 400 },
      );
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: error || "Failed to proxy request" },
      { status: 500 },
    );
  }
}
