import CustomerView from '@/components/CustomerView';

export const metadata = {
  title: 'Bistro Noir — Menu',
  description: 'Browse our full menu, customise your order, and track it live from your table.',
};

export default function HomePage() {
  return <CustomerView />;
}
