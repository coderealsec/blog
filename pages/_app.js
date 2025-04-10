import { SessionProvider } from 'next-auth/react';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';
import { ToastProvider } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

function MyApp({ Component, pageProps }) {
  // Check if the page has a getLayout function
  const getLayout = Component.getLayout || ((page) => 
    <Layout title={Component.title || 'Blog'}>
      {page}
    </Layout>
  );

  return (
    <SessionProvider session={pageProps.session}>
      <ToastProvider>
        {getLayout(<Component {...pageProps} />)}
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  );
}

export default MyApp;
