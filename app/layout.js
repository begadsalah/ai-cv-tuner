import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata = {
  title: 'CVTuner — AI-Powered CV Optimizer',
  description: 'Upload your CV and job description. Google Gemini AI rewrites your resume to pass ATS filters, boost your match score, and generate a tailored cover letter.',
  openGraph: {
    title: 'CVTuner — AI-Powered CV Optimizer',
    description: 'Pass ATS filters and land more interviews. AI-optimized CV in under 60 seconds.',
    url: 'https://cvtuner.app',
    siteName: 'CVTuner',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        {/* Google Translate */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <Script id="google-translate-setup" strategy="afterInteractive">{`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
          }
        `}</Script>

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
