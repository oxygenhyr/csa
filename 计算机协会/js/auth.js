// ============================================
// 认证管理模块 — Supabase
// ============================================

async function checkAuth() {
  if (!isSupabaseConfigured()) {
    return { loggedIn: false, reason: 'Supabase未配置' };
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  return { loggedIn: !!session, user: session?.user };
}

async function adminLogin(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login')) throw new Error('邮箱或密码错误');
    throw new Error('登录失败：' + error.message);
  }
  return data.user;
}

async function adminLogout() {
  await supabaseClient.auth.signOut();
}

// 获取当前登录用户（异步）
async function getCurrentUserAsync() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.user || null;
}
