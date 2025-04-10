import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, title = 'Blog' }) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors with client-side only features
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>{`${title} | My Blog`}</title>
        <meta name="description" content="Blog uygulaması" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Navbar session={mounted ? session : null} />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
} 