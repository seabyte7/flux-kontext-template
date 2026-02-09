import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  respData,
  respAuthErr,
  respErr,
  withErrorHandler,
} from "@/lib/utils/response";
import {
  getAdminSupabase,
  verifyAdmin,
  sanitizeSearchInput,
  logAdminAction,
} from "@/lib/admin-auth";

// 获取用户列表
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !verifyAdmin(session.user.email)) {
    return respAuthErr("Admin access required");
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const rawSearch = searchParams.get("search") || "";
  const search = sanitizeSearchInput(rawSearch);
  const offset = (page - 1) * limit;

  const supabase = getAdminSupabase();

  let query = supabase
    .from("users")
    .select(
      "id, email, name, image, credits, signin_provider, signin_count, last_signin_at, created_at",
      { count: "exact" },
    );

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return respErr(error.message, 500);
  }

  return respData({
    users: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});

// 更新用户积分
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !verifyAdmin(session.user.email)) {
    return respAuthErr("Admin access required");
  }

  const body = await req.json();
  const { userId, credits } = body;

  if (!userId || credits === undefined) {
    return respErr("Missing userId or credits", 400);
  }

  // 积分范围验证
  if (typeof credits !== "number" || credits < 0 || credits > 1_000_000) {
    return respErr("Credits must be a number between 0 and 1,000,000", 400);
  }

  const supabase = getAdminSupabase();

  const { data, error } = await supabase
    .from("users")
    .update({ credits })
    .eq("id", userId)
    .select("id, email, credits")
    .single();

  if (error) {
    return respErr(error.message, 500);
  }

  logAdminAction(session.user.email, "update_credits", {
    targetUserId: userId,
    newCredits: credits,
    previousEmail: data.email,
  });

  return respData({ user: data });
});
