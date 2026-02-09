import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { apiLogger } from "@/lib/logger";

/**
 * 创建管理员级别的 Supabase 客户端（使用 service_role key）
 */
export function getAdminSupabase() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * 验证邮箱是否在管理员列表中
 */
export function verifyAdmin(email: string): boolean {
  const adminEmails = env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  return adminEmails.includes(email);
}

/**
 * 清理搜索输入，移除 PostgREST 过滤器中的特殊字符
 * 防止过滤器注入攻击
 */
export function sanitizeSearchInput(input: string): string {
  // 移除 PostgREST 操作符相关特殊字符: . , ( ) :
  return input.replace(/[.,():\\/]/g, "").trim();
}

/**
 * 管理员积分更新审计日志
 */
export function logAdminAction(
  adminEmail: string,
  action: string,
  details: Record<string, unknown>,
) {
  apiLogger.info({ adminEmail, action, ...details }, `Admin action: ${action}`);
}
