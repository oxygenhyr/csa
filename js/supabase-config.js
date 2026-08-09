// ============================================
// Supabase 配置文件
// ⚠️ 请替换为你在 Supabase 控制台获取的 url 和 anonKey
// 获取方式：app.supabase.com → 你的项目 → Settings → API
// ============================================

const supabaseConfig = {
  url: "https://zwagecuupaxuglvmrttf.supabase.co",
  anonKey: "sb_publishable_iP_h0by762RPOI5wI-NiUA_nHthS8eg",
};

// 初始化
let supabaseClient = null;
let supabaseReady = false;

if (supabaseConfig.url && !supabaseConfig.url.includes('xxxxxxxxxxxx')) {
  try {
    // supabase (SDK) 由 CDN 加载到全局，调用 createClient 获取客户端
    supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
    supabaseReady = true;
    console.log('✅ Supabase 初始化成功');
  } catch (e) {
    console.warn('⚠️ Supabase 初始化失败:', e.message);
  }
} else {
  console.warn('⚠️ Supabase 未配置，使用本地模拟模式');
}

function isSupabaseConfigured() {
  return supabaseReady;
}
