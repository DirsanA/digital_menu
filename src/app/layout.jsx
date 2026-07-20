import './globals.css';
import LayoutClient from './layout-client';

export const metadata = {
  title: 'Digital Menu',
  description: 'Browse our menu, customise your order, and track it live from your table.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}