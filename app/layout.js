import './globals.css';
import Provider from '@/app/provider';
export const metadata = {
    title: 'HV Ecommerce',
    description: 'Next.js ecommerce store with admin management',
};
export default function RootLayout({ children }) {
    return (<html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>);
}
