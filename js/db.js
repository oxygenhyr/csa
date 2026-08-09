// ============================================
// 数据库操作模块 - Supabase 版
// ============================================

const TABLE = 'members';
const LOCAL_KEY = 'csa_members';

// 本地存储备用（Supabase 未配置时）
function getLocalMembers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
  catch { return []; }
}
function saveLocalMembers(members) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(members));
}

// ===== 创建成员（注册报名） =====
async function createMember(data) {
  const member = {
    name: data.name.trim(),
    studentId: data.studentId.trim(),
    department: data.department.trim(),
    grade: data.grade,
    email: data.email.trim(),
    phone: data.phone.trim(),
    skills: data.skills?.trim() || '',
    reason: data.reason?.trim() || '',
    position: '',
    status: 'pending',
    notes: '',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data: result, error } = await supabaseClient
      .from(TABLE).insert([member]).select();
    if (error) throw new Error(error.message);
    return result[0];
  } else {
    const members = getLocalMembers();
    const newMember = { id: 'local_' + Date.now(), ...member };
    members.push(newMember);
    saveLocalMembers(members);
    return newMember;
  }
}

// ===== 获取所有成员（管理员用） =====
async function getAllMembers() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseClient
      .from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  } else {
    return getLocalMembers().sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || ''));
  }
}

// ===== 获取已批准的成员（公开名单） =====
async function getApprovedMembers() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseClient
      .from(TABLE).select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  } else {
    return getLocalMembers()
      .filter(m => m.status === 'approved')
      .sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || ''));
  }
}

// ===== 更新成员状态 =====
async function updateMemberStatus(id, status) {
  if (isSupabaseConfigured()) {
    const { error } = await supabaseClient.from(TABLE).update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const members = getLocalMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx >= 0) { members[idx].status = status; saveLocalMembers(members); }
  }
}

// ===== 更新成员信息 =====
async function updateMember(id, data) {
  const updates = {
    name: data.name.trim(),
    studentId: data.studentId.trim(),
    department: data.department.trim(),
    grade: data.grade,
    email: data.email.trim(),
    phone: data.phone.trim(),
    skills: data.skills?.trim() || '',
    reason: data.reason?.trim() || '',
    position: data.position?.trim() || '',
    notes: data.notes?.trim() || '',
  };
  if (isSupabaseConfigured()) {
    const { error } = await supabaseClient.from(TABLE).update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const members = getLocalMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx >= 0) { members[idx] = { ...members[idx], ...updates }; saveLocalMembers(members); }
  }
}

// ===== 删除成员 =====
async function deleteMember(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const members = getLocalMembers().filter(m => m.id !== id);
    saveLocalMembers(members);
  }
}

// ===== 获取统计数据 =====
async function getStats() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseClient.from(TABLE).select('status');
    if (error) throw new Error(error.message);
    return {
      total: data.length,
      approved: data.filter(m => m.status === 'approved').length,
      pending: data.filter(m => m.status === 'pending').length,
      rejected: data.filter(m => m.status === 'rejected').length,
    };
  } else {
    const members = getLocalMembers();
    return {
      total: members.length,
      approved: members.filter(m => m.status === 'approved').length,
      pending: members.filter(m => m.status === 'pending').length,
      rejected: members.filter(m => m.status === 'rejected').length,
    };
  }
}
