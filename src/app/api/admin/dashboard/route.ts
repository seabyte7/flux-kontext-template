import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { respData, respAuthErr, withErrorHandler } from '@/lib/utils/response'
import { createClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return respAuthErr('Authentication required')
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
  if (!adminEmails.includes(session.user.email)) {
    return respAuthErr('Admin access required')
  }

  const supabase = getAdminSupabase()

  // 并行获取所有统计数据
  const [
    usersResult,
    todayUsersResult,
    ordersResult,
    revenueResult,
    creditsResult,
  ] = await Promise.all([
    // 用户总数
    supabase.from('users').select('*', { count: 'exact', head: true }),
    // 今日注册
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    // 订单总数
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    // 已完成订单收入
    supabase
      .from('orders')
      .select('amount')
      .eq('status', 'completed'),
    // 积分消耗统计
    supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage'),
  ])

  const totalRevenue = revenueResult.data?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0
  const totalCreditsUsed = creditsResult.data?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0

  // 最近注册用户
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, email, name, credits, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // 最近订单
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, amount, currency, status, payment_provider, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return respData({
    stats: {
      totalUsers: usersResult.count || 0,
      todayRegistrations: todayUsersResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalRevenue,
      totalCreditsUsed,
    },
    recentUsers: recentUsers || [],
    recentOrders: recentOrders || [],
  })
})
