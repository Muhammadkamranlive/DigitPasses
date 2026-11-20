import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';
import { PublicLayoutComponent } from './shared/public-layout.component';
import { ShellComponent } from './shared/shell.component';
import { LandingComponent } from './pages/landing.component';
import { PricingComponent } from './pages/pricing.component';
import { ContactComponent } from './pages/contact.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { MerchantDashboardComponent } from './pages/merchant/dashboard.component';
import { PassListComponent } from './pages/merchant/pass-list.component';
import { DesignerComponent } from './pages/merchant/designer.component';
import { IssueComponent } from './pages/merchant/issue.component';
import { RedeemComponent } from './pages/merchant/redeem.component';
import { CustomersComponent } from './pages/merchant/customers.component';
import { TransactionsComponent } from './pages/merchant/transactions.component';
import { DeveloperComponent } from './pages/merchant/developer.component';
import { WalletComponent } from './pages/customer/wallet.component';
import { PassDetailComponent } from './pages/customer/pass-detail.component';
import { AdminHomeComponent } from './pages/admin/home.component';
import { AdminTenantsComponent } from './pages/admin/tenants.component';
import { SalesHomeComponent } from './pages/sales/home.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
    ],
  },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard(['merchant', 'developer'])],
    children: [
      { path: '', component: MerchantDashboardComponent },
      { path: 'passes', component: PassListComponent },
      { path: 'passes/new', component: DesignerComponent },
      { path: 'passes/:id', component: DesignerComponent },
      { path: 'issue', component: IssueComponent },
      { path: 'redeem', component: RedeemComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'developer', component: DeveloperComponent },
    ],
  },
  {
    path: 'wallet',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard(['customer'])],
    children: [
      { path: '', component: WalletComponent },
      { path: 'activity', component: TransactionsComponent },
      { path: 'pass/:id', component: PassDetailComponent },
    ],
  },
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard(['super_admin'])],
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'tenants', component: AdminTenantsComponent },
    ],
  },
  {
    path: 'sales',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard(['sales_rep'])],
    children: [{ path: '', component: SalesHomeComponent }],
  },
  { path: '**', redirectTo: '' },
];
