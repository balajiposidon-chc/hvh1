import './globals.css';
import Provider from '@/app/provider';
export const metadata = {
    title: 'Hill & Valley | Premium Spices & Organic Food',
    description: 'Hill & Valley premium regional spices, coconut-based products, herbal products, and organic food products.',
};
export default function RootLayout({ children }) {
    return (<html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif" }}>
        <Provider>{children}</Provider>
      </body>
    </html>);
}
