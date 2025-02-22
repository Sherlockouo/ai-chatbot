import { auth } from "@/app/(auth)/auth";
import {
  getProviderByUserId,
  createModelConfig,
  deleteModelConfigById,
  getModelConfigById,
  updateModelConfigById,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";

// GET 获取用户配置
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const providers = await getProviderByUserId(session.user.id);
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch configs" },
      { status: 500 },
    );
  }
}

// POST 新建配置
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const newConfig = await createModelConfig({
      userId: session.user.id,
      ...body,
    });
    return NextResponse.json(newConfig);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 },
    );
  }
}

// PATCH 更新配置
export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing config ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // 验证用户权限（确保配置属于当前用户）
    const existingConfig = await getModelConfigById(id);
    if (!existingConfig || existingConfig.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 只允许更新指定字段
    const validUpdates = {
      providerName: body.providerName,
      providerType: body.providerType,
      apiKey: body.apiKey,
      baseUrl: body.baseUrl,
      models: body.models,
    };

    const updatedConfig = await updateModelConfigById(id, validUpdates);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Failed to update model config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE 删除配置
export async function DELETE(req: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const configs = await getProviderByUserId(session.user.id);
    if (!configs || configs[0].userId != session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteModelConfigById(id!);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 },
    );
  }
}
