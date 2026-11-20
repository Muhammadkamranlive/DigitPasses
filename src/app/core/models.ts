export type UserRole = 'super_admin' | 'merchant' | 'customer' | 'sales_rep' | 'developer';

export type PassType = 'gift_card' | 'loyalty_card' | 'membership_card' | 'punch_card';

export type PassStatus =
  | 'template'
  | 'pending_for_send'
  | 'redeemable'
  | 'partially_redeemed'
  | 'fully_redeemed'
  | 'public';

export interface Tenant {
  id: string;
  company_id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  industry?: string;
  status: string;
  plan_name: string;
  sales_rep_id?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  image_url?: string;
  role: UserRole;
  tenant_id?: string | null;
  company_designation?: string;
  created_at: string;
}

export interface WalletPass {
  id: string;
  tenant_id: string;
  type: PassType;
  status: PassStatus;
  background_color: string;
  foreground_color: string;
  label_color: string;
  organization_name: string;
  serial_number: string;
  logo_text?: string;
  logo_url?: string;
  card_holder_name?: string;
  card_holder_title?: string;
  code_type: 'QR' | 'BAR';
  expiration_date?: string | null;
  recipient_name?: string;
  sender_name?: string;
  email?: string;
  phone?: string;
  terms_and_conditions?: string;
  privacy_policy?: string;
  message?: string;
  description?: string;
  balance: number;
  currency_code: string;
  currency_sign: string;
  program_name?: string;
  points_balance: number;
  reward_details?: string;
  member_name?: string;
  membership_number?: string;
  additional_benefits?: string;
  membership_status?: string;
  punch_title?: string;
  total_punches: number;
  current_punches: number;
  issued_from?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vault {
  id: string;
  tenant_id?: string | null;
  user_id?: string | null;
  email: string;
  iban?: string;
  vault_type: 'customer' | 'merchant' | 'platform';
  amount: number;
  currency: string;
  status: string;
}

export interface AccountTransaction {
  id: string;
  tenant_id?: string;
  card_id?: string;
  vault_id?: string;
  user_id?: string;
  customer_email?: string;
  amount: number;
  dr_cr_flag: 'C' | 'D' | 'N';
  txn_type: string;
  redemption_type?: string;
  reference_no?: string;
  balance_before?: number;
  created_at: string;
}

export interface TenantLicense {
  id: string;
  tenant_id: string;
  public_key: string;
  private_key: string;
  status: string;
}

export interface PaymentPlan {
  id: string;
  plan_name: string;
  plan_description: string;
  price: number;
  billing_cycle: string;
  max_cards: number | null;
}

export interface AppState {
  profiles: Profile[];
  tenants: Tenant[];
  passes: WalletPass[];
  vaults: Vault[];
  transactions: AccountTransaction[];
  licenses: TenantLicense[];
  plans: PaymentPlan[];
  sessionUserId: string | null;
}

export const PASS_TYPE_META: Record<
  PassType,
  { label: string; blurb: string; icon: string; accent: string }
> = {
  gift_card: {
    label: 'Gift Card',
    blurb: 'Stored value customers can spend in-store or online.',
    icon: '🎁',
    accent: 'from-violet-500 to-indigo-600',
  },
  loyalty_card: {
    label: 'Loyalty Card',
    blurb: 'Points programs that keep guests coming back.',
    icon: '⭐',
    accent: 'from-amber-400 to-orange-500',
  },
  membership_card: {
    label: 'Membership',
    blurb: 'Paid clubs, perks, and recurring access.',
    icon: '🪪',
    accent: 'from-sky-400 to-blue-600',
  },
  punch_card: {
    label: 'Punch Card',
    blurb: 'Buy 9, get 1 free — classic visits, digital stamps.',
    icon: '☕',
    accent: 'from-rose-400 to-pink-600',
  },
};

export function displayName(p?: Profile | null): string {
  if (!p) return 'Guest';
  return `${p.first_name} ${p.last_name}`.trim();
}

export function emptyPass(partial: Partial<WalletPass> = {}): WalletPass {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    tenant_id: '',
    type: 'gift_card',
    status: 'template',
    background_color: '#5d16ec',
    foreground_color: '#ffffff',
    label_color: '#e9ddff',
    organization_name: 'Arenas Cards',
    serial_number: '',
    logo_text: 'ARENAS',
    card_holder_title: 'Card Holder',
    card_holder_name: 'Guest',
    code_type: 'QR',
    balance: 50,
    currency_code: 'USD',
    currency_sign: '$',
    points_balance: 0,
    total_punches: 10,
    current_punches: 0,
    terms_and_conditions: 'Valid at participating locations. Not redeemable for cash.',
    privacy_policy: 'We never sell holder data.',
    description: 'Digital wallet pass issued with Arenas Cards.',
    created_at: now,
    updated_at: now,
    ...partial,
  };
}
