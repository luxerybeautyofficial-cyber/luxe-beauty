import { getMarketers } from '@/lib/actions';
import MarketersClient from '@/components/marketers/MarketersClient';

export default async function MarketersPage() {
  const marketers = await getMarketers();
  return <MarketersClient initialMarketers={marketers} />;
}
