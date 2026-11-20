import { Injectable, computed, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { buildDemoState, DEMO_PASSWORD } from './demo-data';
import { environment } from './environment';
import {
  AccountTransaction,
  AppState,
  PaymentPlan,
  Profile,
  Tenant,
  TenantLicense,
  UserRole,
  Vault,
  WalletPass,
  emptyPass,
} from './models';

const LS_KEY = 'arenas-cards-demo-v1';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly demoMode = !environment.supabaseUrl || !environment.supabaseAnonKey;
  private client: SupabaseClient | null = null;
  private state = signal<AppState>(this.readDemo());

  readonly profile = computed(() => {
    const s = this.state();
    return s.profiles.find((p) => p.id === s.sessionUserId) ?? null;
  });
  readonly tenant = computed(() => {
    const p = this.profile();
    if (!p?.tenant_id) return null;
    return this.state().tenants.find((t) => t.id === p.tenant_id) ?? null;
  });
  readonly ready = signal(false);

  constructor() {
    if (!this.demoMode) {
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    }
  }

  async hydrate(): Promise<void> {
    if (this.demoMode) {
      this.ready.set(true);
      return;
    }
    const { data } = await this.client!.auth.getSession();
    if (data.session?.user) {
      await this.loadCloudProfile(data.session.user.id);
    }
    this.ready.set(true);
  }

  private readDemo(): AppState {
    if (typeof localStorage === 'undefined') return buildDemoState();
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return buildDemoState();
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      return buildDemoState();
    }
  }

  private persist(): void {
    if (!this.demoMode) return;
    localStorage.setItem(LS_KEY, JSON.stringify(this.state()));
  }

  resetDemo(): void {
    localStorage.removeItem(LS_KEY);
    this.state.set(buildDemoState());
  }

  roleHome(role?: UserRole | null): string {
    switch (role) {
      case 'super_admin':
        return '/admin';
      case 'merchant':
      case 'developer':
        return '/app';
      case 'customer':
        return '/wallet';
      case 'sales_rep':
        return '/sales';
      default:
        return '/login';
    }
  }

  async login(email: string, password: string): Promise<Profile> {
    if (this.demoMode) {
      if (password !== DEMO_PASSWORD) throw new Error('Use password demo1234 in demo mode.');
      const user = this.state().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('Unknown demo account.');
      this.state.update((s) => ({ ...s, sessionUserId: user.id }));
      this.persist();
      return user;
    }
    const { data, error } = await this.client!.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return this.loadCloudProfile(data.user.id);
  }

  async register(input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'merchant' | 'customer';
    company?: string;
  }): Promise<Profile> {
    if (this.demoMode) {
      if (this.state().profiles.some((p) => p.email.toLowerCase() === input.email.toLowerCase())) {
        throw new Error('That email is already registered in this demo.');
      }
      const id = crypto.randomUUID();
      let tenantId: string | null = null;
      if (input.role === 'merchant') {
        const tenant: Tenant = {
          id: crypto.randomUUID(),
          company_id: Math.floor(Math.random() * 9000) + 1000,
          name: input.company || `${input.first_name}'s Shop`,
          email: input.email,
          status: 'active',
          plan_name: 'Starter',
          created_at: new Date().toISOString(),
        };
        tenantId = tenant.id;
        this.state.update((s) => ({
          ...s,
          tenants: [...s.tenants, tenant],
          vaults: [
            ...s.vaults,
            {
              id: crypto.randomUUID(),
              tenant_id: tenant.id,
              user_id: id,
              email: input.email,
              vault_type: 'merchant',
              amount: 1000,
              currency: 'USD',
              status: 'open',
              iban: 'AC' + id.replace(/-/g, '').slice(0, 14).toUpperCase(),
            },
          ],
          licenses: [
            ...s.licenses,
            {
              id: crypto.randomUUID(),
              tenant_id: tenant.id,
              public_key: 'pk_demo_' + id.slice(0, 12),
              private_key: 'sk_demo_' + id.slice(0, 18),
              status: 'active',
            },
          ],
        }));
      }
      const profile: Profile = {
        id,
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        role: input.role,
        tenant_id: tenantId,
        company_designation: input.company,
        created_at: new Date().toISOString(),
      };
      this.state.update((s) => ({
        ...s,
        profiles: [...s.profiles, profile],
        sessionUserId: id,
      }));
      this.persist();
      return profile;
    }

    const { data, error } = await this.client!.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          role: input.role,
          company: input.company,
        },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Check your email to confirm the account.');
    return this.loadCloudProfile(data.user.id);
  }

  async logout(): Promise<void> {
    if (!this.demoMode) await this.client!.auth.signOut();
    this.state.update((s) => ({ ...s, sessionUserId: null }));
    this.persist();
  }

  templates(): WalletPass[] {
    const t = this.tenant();
    const me = this.profile();
    return this.state().passes.filter((p) => {
      if (p.status !== 'template') return false;
      if (me?.role === 'super_admin') return true;
      return t && p.tenant_id === t.id;
    });
  }

  issuedPasses(): WalletPass[] {
    const t = this.tenant();
    const me = this.profile();
    return this.state().passes.filter((p) => {
      if (p.status === 'template') return false;
      if (me?.role === 'customer') return p.email === me.email;
      if (me?.role === 'super_admin') return true;
      return t && p.tenant_id === t.id;
    });
  }

  customers(): Profile[] {
    const t = this.tenant();
    const me = this.profile();
    return this.state().profiles.filter((p) => {
      if (p.role !== 'customer') return false;
      if (me?.role === 'super_admin') return true;
      return t && p.tenant_id === t.id;
    });
  }

  transactions(): AccountTransaction[] {
    const t = this.tenant();
    const me = this.profile();
    return this.state()
      .transactions.filter((tx) => {
        if (me?.role === 'customer') return tx.customer_email === me.email;
        if (me?.role === 'super_admin') return true;
        return t && tx.tenant_id === t.id;
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  vaultFor(type: Vault['vault_type'], tenantId?: string | null): Vault | undefined {
    return this.state().vaults.find(
      (v) => v.vault_type === type && (!tenantId || v.tenant_id === tenantId),
    );
  }

  myVault(): Vault | undefined {
    const me = this.profile();
    return this.state().vaults.find((v) => v.user_id === me?.id);
  }

  license(): TenantLicense | undefined {
    const t = this.tenant();
    return this.state().licenses.find((l) => l.tenant_id === t?.id);
  }

  plans(): PaymentPlan[] {
    return this.state().plans;
  }

  async rotateKeys(): Promise<void> {
    const t = this.tenant();
    const current = this.license();
    if (!t || !current) return;
    const next = {
      ...current,
      public_key: 'pk_live_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      private_key: 'sk_live_' + crypto.randomUUID().replace(/-/g, '').slice(0, 22),
    };
    if (!this.demoMode) {
      const { error } = await this.client!.from('tenant_licenses').update({
        public_key: next.public_key,
        private_key: next.private_key,
        updated_at: new Date().toISOString(),
      }).eq('id', current.id);
      if (error) throw error;
      await this.reloadCloud();
      return;
    }
    this.state.update((s) => ({
      ...s,
      licenses: s.licenses.map((l) => (l.id === current.id ? next : l)),
    }));
    this.persist();
  }

  passById(id: string): WalletPass | undefined {
    return this.state().passes.find((p) => p.id === id);
  }

  passBySerial(serial: string): WalletPass | undefined {
    return this.state().passes.find(
      (p) => p.serial_number.toLowerCase() === serial.trim().toLowerCase(),
    );
  }

  async saveTemplate(pass: WalletPass): Promise<WalletPass> {
    const me = this.profile();
    const tenant = this.tenant();
    if (!me || !tenant) throw new Error('Sign in as a merchant first.');
    const saved: WalletPass = {
      ...emptyPass(pass),
      tenant_id: tenant.id,
      organization_name: pass.organization_name || tenant.name,
      status: 'template',
      serial_number: pass.serial_number || this.nextSerial(pass.type),
      updated_at: new Date().toISOString(),
    };
    if (!this.demoMode) {
      const { error } = await this.client!.from('wallet_passes').upsert(toPassRow(saved));
      if (error) throw error;
      await this.reloadCloud();
      return this.passById(saved.id) ?? saved;
    }
    const exists = this.state().passes.some((p) => p.id === saved.id);
    this.state.update((s) => ({
      ...s,
      passes: exists ? s.passes.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...s.passes],
    }));
    this.persist();
    return saved;
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.demoMode) {
      const { error } = await this.client!.from('wallet_passes').delete().eq('id', id);
      if (error) throw error;
      await this.reloadCloud();
      return;
    }
    this.state.update((s) => ({ ...s, passes: s.passes.filter((p) => p.id !== id) }));
    this.persist();
  }

  async assignPass(templateId: string, email: string, firstName: string, lastName: string): Promise<WalletPass> {
    const tpl = this.passById(templateId);
    const me = this.profile();
    if (!tpl || tpl.status !== 'template') throw new Error('Template not found.');
    if (!me) throw new Error('Not signed in.');

    const merchantVault = this.state().vaults.find(
      (v) => v.tenant_id === tpl.tenant_id && v.vault_type === 'merchant',
    );
    if (tpl.type === 'gift_card' && merchantVault && merchantVault.amount < tpl.balance) {
      throw new Error('Merchant vault does not have enough balance to issue this card.');
    }

    if (!this.demoMode) {
      const { data, error } = await this.client!.rpc('assign_pass', {
        p_template_id: templateId,
        p_email: email,
        p_first_name: firstName,
        p_last_name: lastName,
      });
      if (error) throw error;
      await this.reloadCloud();
      const issuedCloud = this.passById(String(data));
      if (!issuedCloud) throw new Error('Pass was issued but could not be reloaded.');
      return issuedCloud;
    }

    const issued: WalletPass = {
      ...tpl,
      id: crypto.randomUUID(),
      status: 'redeemable',
      serial_number: this.nextSerial(tpl.type),
      email,
      recipient_name: `${firstName} ${lastName}`.trim(),
      card_holder_name: `${firstName} ${lastName}`.trim(),
      member_name: `${firstName} ${lastName}`.trim(),
      sender_name: `${me.first_name} ${me.last_name}`,
      issued_from: tpl.id,
      current_punches: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const txn: AccountTransaction = {
      id: crypto.randomUUID(),
      tenant_id: tpl.tenant_id,
      card_id: issued.id,
      vault_id: merchantVault?.id,
      user_id: me.id,
      customer_email: email,
      amount: tpl.type === 'gift_card' ? tpl.balance : 0,
      dr_cr_flag: 'D',
      txn_type: 'PassIssuance',
      redemption_type: 'Issue',
      balance_before: merchantVault?.amount,
      created_at: new Date().toISOString(),
    };

    this.state.update((s) => ({
      ...s,
      passes: [issued, ...s.passes],
      vaults: s.vaults.map((v) =>
        v.id === merchantVault?.id && tpl.type === 'gift_card'
          ? { ...v, amount: Number((v.amount - tpl.balance).toFixed(2)) }
          : v,
      ),
      transactions: [txn, ...s.transactions],
      profiles: s.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())
        ? s.profiles
        : [
            ...s.profiles,
            {
              id: crypto.randomUUID(),
              first_name: firstName,
              last_name: lastName,
              email,
              role: 'customer',
              tenant_id: tpl.tenant_id,
              created_at: new Date().toISOString(),
            },
          ],
    }));
    this.persist();
    return issued;
  }

  async redeem(serial: string, amount: number, kind = 'in_store'): Promise<WalletPass> {
    const card = this.passBySerial(serial);
    const me = this.profile();
    if (!card) throw new Error('No pass matches that serial.');
    if (!['redeemable', 'partially_redeemed'].includes(card.status)) {
      throw new Error('This pass is not redeemable.');
    }
    if (me?.role === 'merchant' && card.tenant_id !== me.tenant_id) {
      throw new Error('This pass belongs to another merchant.');
    }

    if (!this.demoMode) {
      const { error } = await this.client!.rpc('redeem_pass', {
        p_serial: serial,
        p_amount: amount,
        p_kind: kind,
      });
      if (error) throw error;
      await this.reloadCloud();
      const nextCloud = this.passBySerial(serial);
      if (!nextCloud) throw new Error('Redemption posted but the pass could not be reloaded.');
      return nextCloud;
    }

    const next = { ...card, updated_at: new Date().toISOString() };
    let amt = amount;

    if (card.type === 'gift_card') {
      if (amount <= 0 || amount > card.balance) throw new Error('Amount is not valid for this balance.');
      next.balance = Number((card.balance - amount).toFixed(2));
      next.status = next.balance === 0 ? 'fully_redeemed' : 'partially_redeemed';
    } else if (card.type === 'punch_card') {
      next.current_punches = Math.min(card.total_punches, card.current_punches + 1);
      next.status = next.current_punches >= card.total_punches ? 'fully_redeemed' : 'partially_redeemed';
      amt = 1;
    } else if (card.type === 'loyalty_card') {
      const pts = amount || 10;
      next.points_balance = Math.max(0, card.points_balance - pts);
      next.status = 'partially_redeemed';
      amt = pts;
    } else {
      next.status = 'fully_redeemed';
    }

    const txn: AccountTransaction = {
      id: crypto.randomUUID(),
      tenant_id: card.tenant_id,
      card_id: card.id,
      user_id: me?.id,
      customer_email: card.email,
      amount: amt,
      dr_cr_flag: 'D',
      txn_type: 'Redemption',
      redemption_type: kind,
      balance_before: card.balance,
      created_at: new Date().toISOString(),
    };

    this.state.update((s) => ({
      ...s,
      passes: s.passes.map((p) => (p.id === card.id ? next : p)),
      transactions: [txn, ...s.transactions],
    }));
    this.persist();
    return next;
  }

  merchantsForSales(): Tenant[] {
    const me = this.profile();
    if (me?.role === 'super_admin') return this.state().tenants.filter((t) => t.company_id > 1);
    return this.state().tenants.filter((t) => t.sales_rep_id === me?.id);
  }

  allTenants(): Tenant[] {
    return this.state().tenants;
  }

  allProfiles(): Profile[] {
    return this.state().profiles;
  }

  async setTenantStatus(id: string, status: string): Promise<void> {
    if (!this.demoMode) {
      const { error } = await this.client!.from('tenants').update({ status }).eq('id', id);
      if (error) throw error;
      await this.reloadCloud();
      return;
    }
    this.state.update((s) => ({
      ...s,
      tenants: s.tenants.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    this.persist();
  }

  private async reloadCloud(): Promise<void> {
    const id = this.state().sessionUserId;
    if (!id) return;
    await this.loadCloudProfile(id);
  }

  stats() {
    const issued = this.issuedPasses();
    const templates = this.templates();
    const tx = this.transactions();
    const redeemed = issued.filter((p) =>
      ['partially_redeemed', 'fully_redeemed'].includes(p.status),
    );
    const giftValue = issued
      .filter((p) => p.type === 'gift_card')
      .reduce((sum, p) => sum + p.balance, 0);
    return {
      templates: templates.length,
      issued: issued.length,
      redeemed: redeemed.length,
      customers: this.customers().length,
      outstanding: giftValue,
      volume: tx.reduce((sum, t) => sum + t.amount, 0),
    };
  }

  private nextSerial(type: WalletPass['type']): string {
    const prefix = { gift_card: 'GC', loyalty_card: 'LY', membership_card: 'MB', punch_card: 'PC' }[type];
    return `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto
      .randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;
  }

  private async loadCloudProfile(userId: string): Promise<Profile> {
    const { data: profile, error } = await this.client!.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;

    const tenantId = profile.tenant_id as string | null;
    const [tenants, passes, vaults, txns, licenses, plans, people] = await Promise.all([
      this.client!.from('tenants').select('*'),
      this.client!.from('wallet_passes').select('*'),
      this.client!.from('vaults').select('*'),
      this.client!.from('account_transactions').select('*').order('created_at', { ascending: false }),
      this.client!.from('tenant_licenses').select('*'),
      this.client!.from('payment_plans').select('*'),
      this.client!.from('profiles').select('*'),
    ]);

    this.state.set({
      profiles: (people.data ?? []) as Profile[],
      tenants: (tenants.data ?? []) as Tenant[],
      passes: ((passes.data ?? []) as Record<string, unknown>[]).map(mapPass),
      vaults: (vaults.data ?? []) as Vault[],
      transactions: ((txns.data ?? []) as Record<string, unknown>[]).map(mapTxn),
      licenses: (licenses.data ?? []) as TenantLicense[],
      plans: (plans.data ?? []) as AppState['plans'],
      sessionUserId: userId,
    });
    return profile as Profile;
  }
}

function toPassRow(p: WalletPass): Record<string, unknown> {
  return {
    id: p.id,
    tenant_id: p.tenant_id,
    type: p.type,
    status: p.status,
    background_color: p.background_color,
    foreground_color: p.foreground_color,
    label_color: p.label_color,
    organization_name: p.organization_name,
    serial_number: p.serial_number,
    logo_text: p.logo_text ?? null,
    logo_url: p.logo_url ?? null,
    card_holder_name: p.card_holder_name ?? null,
    card_holder_title: p.card_holder_title ?? null,
    code_type: p.code_type,
    expiration_date: p.expiration_date || null,
    recipient_name: p.recipient_name ?? null,
    sender_name: p.sender_name ?? null,
    email: p.email ?? null,
    phone: p.phone ?? null,
    terms_and_conditions: p.terms_and_conditions ?? null,
    privacy_policy: p.privacy_policy ?? null,
    message: p.message ?? null,
    description: p.description ?? null,
    balance: p.balance,
    currency_code: p.currency_code,
    currency_sign: p.currency_sign,
    program_name: p.program_name ?? null,
    points_balance: p.points_balance,
    reward_details: p.reward_details ?? null,
    member_name: p.member_name ?? null,
    membership_number: p.membership_number ?? null,
    additional_benefits: p.additional_benefits ?? null,
    membership_status: p.membership_status ?? null,
    punch_title: p.punch_title ?? null,
    total_punches: p.total_punches,
    current_punches: p.current_punches,
    issued_from: p.issued_from ?? null,
    updated_at: p.updated_at,
  };
}

function mapPass(row: Record<string, unknown>): WalletPass {
  return {
    ...(row as unknown as WalletPass),
    background_color: String(row['background_color'] ?? '#5d16ec'),
    foreground_color: String(row['foreground_color'] ?? '#fff'),
    label_color: String(row['label_color'] ?? '#ddd6fe'),
    organization_name: String(row['organization_name'] ?? ''),
    serial_number: String(row['serial_number'] ?? ''),
    code_type: (row['code_type'] as 'QR' | 'BAR') ?? 'QR',
    balance: Number(row['balance'] ?? 0),
    currency_code: String(row['currency_code'] ?? 'USD'),
    currency_sign: String(row['currency_sign'] ?? '$'),
    points_balance: Number(row['points_balance'] ?? 0),
    total_punches: Number(row['total_punches'] ?? 10),
    current_punches: Number(row['current_punches'] ?? 0),
    created_at: String(row['created_at'] ?? ''),
    updated_at: String(row['updated_at'] ?? ''),
    tenant_id: String(row['tenant_id'] ?? ''),
    type: row['type'] as WalletPass['type'],
    status: (row['status'] as WalletPass['status']) ?? 'template',
    id: String(row['id']),
  };
}

function mapTxn(row: Record<string, unknown>): AccountTransaction {
  return {
    id: String(row['id']),
    tenant_id: row['tenant_id'] as string,
    card_id: row['card_id'] as string,
    vault_id: row['vault_id'] as string,
    user_id: row['user_id'] as string,
    customer_email: row['customer_email'] as string,
    amount: Number(row['amount'] ?? 0),
    dr_cr_flag: (row['dr_cr_flag'] as AccountTransaction['dr_cr_flag']) ?? 'N',
    txn_type: String(row['txn_type'] ?? ''),
    redemption_type: row['redemption_type'] as string,
    reference_no: row['reference_no'] as string,
    balance_before: row['balance_before'] as number,
    created_at: String(row['created_at'] ?? ''),
  };
}
