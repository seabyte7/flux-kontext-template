import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { respData, respAuthErr, respErr, withErrorHandler } from '@/lib/utils/response'
import { createClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function verifyAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
  return adminEmails.includes(email)
}

// 获取用户列表
export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !verifyAdmin(session.user.email)) {
    return respAuthErr('Admin access required')
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const offset = (page - 1) * limit

  const supabase = getAdminSupabase()

  let query = supabase
    .from('users')
    .select('id, email, name, image, credits, signin_provider, signin_count, last_signin_at, created_at', { count: 'exact' })

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return respErr(error.message, 500)
  }

  return respData({
    users: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
})

// 更新用户积分
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !verifyAdmin(session.user.email)) {
    return respAuthErr('Admin access required')
  }

  const body = await req.json()
  const { userId, credits } = body

  if (!userId || credits === undefined) {
    return respErr('Missing userId or credits', 400)
  }

  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('users')
    .update({ credits })
    .eq('id', userId)
    .select('id, email, credits')
    .single()

  if (error) {
    return respErr(error.message, 500)
  }

  console.log(`Admin ${session.user.email} updated user ${userId} credits to ${credits}`)

  return respData({ user: data })
})
