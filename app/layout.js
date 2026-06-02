import './globals.css';
import Provider from '@/app/provider';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';

export const metadata = {
    title: 'Hill & Valley | Premium Spices & Organic Food',
    description: 'Hill & Valley premium regional spices, coconut-based products, herbal products, and organic food products.',
};

export default async function RootLayout({ children }) {
    await connectToDatabase();
    const setting = await Setting.findOne().lean() || {};
    
    const theme = setting.themeMode || 'light';
    const primary = setting.primaryColor || '#D2143A';
    const bg = setting.bgColor || (theme === 'light' ? '#F8F9FA' : '#12100E');
    const font = setting.fontColor || (theme === 'light' ? '#1A1A1A' : '#E7E5E4');
    
    const isLight = theme === 'light';
    const cardBg = isLight ? '#FFFFFF' : '#1C1917';
    const border = isLight ? '#E2E8F0' : 'rgba(197, 168, 128, 0.15)';
    const bgLight = isLight ? '#F1F5F9' : '#26211E';
    const textMuted = isLight ? '#64748B' : '#A3A3A3';
    const glassBg = isLight ? 'rgba(248, 249, 250, 0.85)' : 'rgba(18, 16, 14, 0.85)';
    const stoneDark = isLight ? '#F1F5F9' : '#0A0908';
    
    return (<html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --dynamic-color-scheme: ${theme};
            --dynamic-primary: ${primary};
            --dynamic-bg: ${bg};
            --dynamic-font: ${font};
            --dynamic-card: ${cardBg};
            --dynamic-border: ${border};
            --dynamic-bg-light: ${bgLight};
            --dynamic-text-muted: ${textMuted};
            --dynamic-glass-bg: ${glassBg};
            --dynamic-stone-dark: ${stoneDark};
          }
        `}} />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif" }}>
        <Provider>{children}</Provider>
      </body>
    </html>);
}
