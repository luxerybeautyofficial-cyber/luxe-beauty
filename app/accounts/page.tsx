import { getAccounts, getMarketers } from '@/lib/actions';
import AccountsClient from '@/components/accounts/AccountsClient';

export default async function AccountsPage() {
  const [accounts, marketers] = await Promise.all([getAccounts(), getMarketers(true)]);
  return <AccountsClient initialAccounts={accounts} marketers={marketers} />;
}
