import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, title = 'Blog' }) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors with client-side only features
  useEffect(() => {
    setMounted(true);
    
    // Log session status
    console.log('Session status:', status);
    if (status === 'authenticated' && session) {
      console.log('User authenticated:', session.user?.email);
    }
  }, [session, status]);

  return (
    <>
      <Head>
        <title>{`${title} | DevOpsHub`}</title>
        <meta name="description" content="DevOps, Kubernetes ve Cloud Teknolojileri" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        {/* Navbar sadece client-side'da render edilsin */}
        {mounted && <Navbar session={session} />}
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
} 