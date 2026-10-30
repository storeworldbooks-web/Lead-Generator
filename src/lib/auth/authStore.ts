import { User, AuthSession, SubscriptionTier } from '@/types';
import { generateSalt, generateSessionToken, hashPassword, verifyPassword } from './crypto';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: 'admin' | 'user';
  plan: SubscriptionTier;
  status: 'active' | 'suspended';
  harvests_used: number;
  created_at: string;
}

interface StoredSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Global in-memory fallback for local development or serverless restarts
const memoryUsers = new Map<string, StoredUser>();
const memorySessions = new Map<string, StoredSession>();

let initialized = false;

async function ensureDefaultAccounts() {
  if (initialized) return;
  initialized = true;

  // 1. Admin Account: LeadGenerator Master Admin
  const adminEmail = 'admin@leadgenerator.io';
  const adminSalt = generateSalt();
  const adminHash = await hashPassword('Admin123!', adminSalt);

  const adminUser: StoredUser = {
    id: 'usr_admin_001',
    name: 'SuperAdmin',
    email: adminEmail,
    password_hash: adminHash,
    password_salt: adminSalt,
    role: 'admin',
    plan: 'AGENCY',
    status: 'active',
    harvests_used: 12,
    created_at: new Date().toISOString(),
  };
  memoryUsers.set(adminEmail.toLowerCase(), adminUser);

  // 2. Demo User Account: Alex Demo
  const demoEmail = 'demo@leadgenerator.io';
  const demoSalt = generateSalt();
  const demoHash = await hashPassword('Password123!', demoSalt);

  const demoUser: StoredUser = {
    id: 'usr_demo_123',
    name: 'Alex Demo',
    email: demoEmail,
    password_hash: demoHash,
    password_salt: demoSalt,
    role: 'user',
    plan: 'PRO',
    status: 'active',
    harvests_used: 340,
    created_at: new Date().toISOString(),
  };
  memoryUsers.set(demoEmail.toLowerCase(), demoUser);
}

// Helper to access D1 from Cloudflare context if present
function getD1Binding(): any {
  if (typeof process !== 'undefined' && (process.env as any)?.DB) {
    return (process.env as any).DB;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).DB) {
    return (globalThis as any).DB;
  }
  return null;
}

function mapStoredToUser(stored: StoredUser | any): User {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role || 'user',
    plan: stored.plan || 'FREE',
    status: stored.status || 'active',
    harvestsUsedThisMonth: stored.harvests_used ?? stored.harvestsUsedThisMonth ?? 0,
    createdAt: stored.created_at || stored.createdAt,
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): Promise<{ user: User; session: AuthSession }> {
  await ensureDefaultAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const d1 = getD1Binding();
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  if (d1) {
    const existing = await d1.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    await d1
      .prepare(
        'INSERT INTO users (id, name, email, password_hash, password_salt, role, plan, status, harvests_used, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, cleanName, cleanEmail, hash, salt, role, 'FREE', 'active', 0, now, now)
      .run();
  } else {
    if (memoryUsers.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const stored: StoredUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password_hash: hash,
      password_salt: salt,
      role,
      plan: 'FREE',
      status: 'active',
      harvests_used: 0,
      created_at: now,
    };
    memoryUsers.set(cleanEmail, stored);
  }

  const user: User = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    role,
    plan: 'FREE',
    status: 'active',
    harvestsUsedThisMonth: 0,
    createdAt: now,
  };

  const session = await createSession(userId);
  return { user, session };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
  await ensureDefaultAccounts();
  const cleanEmail = email.trim().toLowerCase();

  const d1 = getD1Binding();
  let stored: StoredUser | null = null;

  if (d1) {
    stored = await d1.prepare('SELECT * FROM users WHERE email = ?').bind(cleanEmail).first();
  } else {
    stored = memoryUsers.get(cleanEmail) || null;
  }

  if (!stored) {
    throw new Error('Invalid email or password.');
  }

  if (stored.status === 'suspended') {
    throw new Error('This account has been suspended by an administrator. Please contact support.');
  }

  const isValid = await verifyPassword(password, stored.password_salt, stored.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const user = mapStoredToUser(stored);
  const session = await createSession(user.id);
  return { user, session };
}

export async function createSession(userId: string): Promise<AuthSession> {
  const token = generateSessionToken();
  const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  // 7 days expiration
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const d1 = getD1Binding();
  let user: User | null = null;

  if (d1) {
    await d1
      .prepare('INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(sessionId, userId, token, expiresAt, now)
      .run();

    const u = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    if (u) {
      user = mapStoredToUser(u);
    }
  } else {
    memorySessions.set(token, {
      id: sessionId,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: now,
    });

    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        user = mapStoredToUser(u);
        break;
      }
    }
  }

  if (!user) {
    throw new Error('User not found.');
  }

  return {
    user,
    token,
    expiresAt,
  };
}

export async function validateSessionToken(token: string): Promise<User | null> {
  await ensureDefaultAccounts();
  if (!token) return null;

  const d1 = getD1Binding();
  if (d1) {
    const row = await d1
      .prepare(
        `SELECT u.*, s.expires_at 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token = ?`
      )
      .bind(token)
      .first();

    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) {
      await d1.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      return null;
    }

    if (row.status === 'suspended') return null;

    return mapStoredToUser(row);
  }

  const session = memorySessions.get(token);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    memorySessions.delete(token);
    return null;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === session.user_id) {
      if (u.status === 'suspended') return null;
      return mapStoredToUser(u);
    }
  }

  return null;
}

export async function deleteSessionToken(token: string): Promise<void> {
  if (!token) return;
  const d1 = getD1Binding();
  if (d1) {
    await d1.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  } else {
    memorySessions.delete(token);
  }
}

// ============================================================================
// ADMIN MANAGEMENT METHODS
// ============================================================================

export async function getAllUsers(): Promise<User[]> {
  await ensureDefaultAccounts();
  const d1 = getD1Binding();

  if (d1) {
    const { results } = await d1.prepare('SELECT id, name, email, role, plan, status, harvests_used, created_at FROM users ORDER BY created_at DESC').all();
    return (results || []).map(mapStoredToUser);
  }

  const list: User[] = [];
  for (const u of memoryUsers.values()) {
    list.push(mapStoredToUser(u));
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
  await ensureDefaultAccounts();
  const d1 = getD1Binding();

  if (d1) {
    await d1.prepare('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?').bind(role, userId).run();
    return;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      u.role = role;
      break;
    }
  }
}

export async function updateUserPlan(userId: string, plan: SubscriptionTier): Promise<void> {
  await ensureDefaultAccounts();
  const d1 = getD1Binding();

  if (d1) {
    await d1.prepare('UPDATE users SET plan = ?, updated_at = datetime("now") WHERE id = ?').bind(plan, userId).run();
    return;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      u.plan = plan;
      break;
    }
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
  await ensureDefaultAccounts();
  const d1 = getD1Binding();

  if (d1) {
    await d1.prepare('UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?').bind(status, userId).run();
    return;
  }

  for (const u of memoryUsers.values()) {
    if (u.id === userId) {
      u.status = status;
      break;
    }
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await ensureDefaultAccounts();
  const d1 = getD1Binding();

  if (d1) {
    await d1.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
    await d1.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return;
  }

  for (const [email, u] of memoryUsers.entries()) {
    if (u.id === userId) {
      memoryUsers.delete(email);
      break;
    }
  }

  for (const [token, s] of memorySessions.entries()) {
    if (s.user_id === userId) {
      memorySessions.delete(token);
    }
  }
}

export async function getAdminMetrics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  planBreakdown: Record<SubscriptionTier, number>;
  totalHarvests: number;
}> {
  const users = await getAllUsers();
  const breakdown: Record<SubscriptionTier, number> = {
    FREE: 0,
    STARTER: 0,
    PRO: 0,
    AGENCY: 0,
  };

  let totalHarvests = 0;
  let activeUsers = 0;
  let suspendedUsers = 0;

  for (const u of users) {
    breakdown[u.plan] = (breakdown[u.plan] || 0) + 1;
    totalHarvests += u.harvestsUsedThisMonth || 0;
    if (u.status === 'active') activeUsers++;
    else suspendedUsers++;
  }

  return {
    totalUsers: users.length,
    activeUsers,
    suspendedUsers,
    planBreakdown: breakdown,
    totalHarvests,
  };
}


// ============================================================================
// HARVEST USAGE TRACKING
// ============================================================================

export async function incrementHarvestUsage(userId: string, count: number): Promise<void> {
  const d1 = getD1Binding();
  if (d1) {
    await d1
      .prepare('UPDATE users SET harvests_used = harvests_used + ? WHERE id = ?')
      .bind(count, userId)
      .run();
    return;
  }

  // In-memory fallback: update the user in the map
  for (const [email, u] of memoryUsers.entries()) {
    if (u.id === userId) {
      memoryUsers.set(email, {
        ...u,
        harvests_used: (u.harvests_used ?? 0) + count,
      });
      break;
    }
  }
}
