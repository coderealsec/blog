import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const errorTypes = {
  Configuration: {
    title: 'Sunucu Hatası',
    message: 'Sunucu yapılandırmasında bir sorun var. Lütfen destek ekibiyle iletişime geçin.',
  },
  AccessDenied: {
    title: 'Erişim Reddedildi',
    message: 'Giriş yapma izniniz yok.',
  },
  Verification: {
    title: 'Giriş Yapılamadı',
    message: 'Giriş bağlantısı artık geçerli değil. Daha önce kullanılmış veya süresi dolmuş olabilir.',
  },
  default: {
    title: 'Kimlik Doğrulama Hatası',
    message: 'Kimlik doğrulama sırasında bir hata oluştu.',
  },
};

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;
  
  const errorType = error && errorTypes[error] ? errorTypes[error] : errorTypes.default;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{errorType.title}</CardTitle>
          <CardDescription className="text-center">
            {errorType.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500 mt-2">
            {error && <p>Hata kodu: {error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/auth/login" passHref>
            <Button variant="outline">Giriş Sayfasına Dön</Button>
          </Link>
          <Link href="/" passHref>
            <Button>Ana Sayfa</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Set a title for this page
ErrorPage.title = 'Hata'; 