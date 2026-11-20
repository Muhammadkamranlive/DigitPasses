-- Grants and extra policies so Angular can persist templates and rotate keys.

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.assign_pass(uuid, text, text, text) to authenticated;
grant execute on function public.redeem_pass(text, numeric, text) to authenticated;
grant execute on function public.next_serial(text) to authenticated;

drop policy if exists "licenses rotate" on public.tenant_licenses;
create policy "licenses rotate" on public.tenant_licenses
  for update using (public.is_super_admin() or tenant_id = public.my_tenant_id())
  with check (public.is_super_admin() or tenant_id = public.my_tenant_id());

drop policy if exists "tenants admin write" on public.tenants;
create policy "tenants admin write" on public.tenants
  for update using (public.is_super_admin())
  with check (public.is_super_admin());
