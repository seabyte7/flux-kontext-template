import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  respData,
  respAuthErr,
  respErr,
  withErrorHandler,
} from "@/lib/utils/response";
import { getAdminSupabase, verifyAdmin } from "@/lib/admin-auth";

// 获取订单列表
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !verifyAdmin(session.user.email)) {
    return respAuthErr("Admin access required");
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const offset = (page - 1) * limit;

  const supabase = getAdminSupabase();

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return respErr(error.message, 500);
  }

  return respData({
    orders: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
});
