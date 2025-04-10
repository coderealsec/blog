import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simüle edilmiş form gönderimi
    setTimeout(() => {
      console.log('Form data:', formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-6 text-center">İletişim</h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Sorularınız veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Adres</h3>
            <p className="text-gray-600">
              Atatürk Bulvarı No:123<br />
              Çankaya/Ankara<br />
              Türkiye
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Telefon</h3>
            <p className="text-gray-600">
              +90 (312) 123 45 67<br />
              +90 (555) 987 65 43
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">E-posta</h3>
            <p className="text-gray-600">
              info@myblog.com<br />
              destek@myblog.com
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Formu</CardTitle>
              <CardDescription>
                Aşağıdaki formu doldurarak bize mesaj gönderebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Konu</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Mesajınızın konusu"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mesajınızı buraya yazın..."
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {submitSuccess && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </CardFooter>
          </Card>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Çalışma Saatlerimiz</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Çalışma Saatleri</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pazartesi - Cuma:</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumartesi:</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Pazar:</span>
                  <span>Kapalı</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Mesai saatleri dışında da e-posta yoluyla bize ulaşabilirsiniz. 
                  En kısa sürede size dönüş yapacağız.
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Sosyal Medya</h2>
              <p className="text-gray-600 mb-4">
                Güncel haberler ve duyurular için sosyal medya hesaplarımızı takip edebilirsiniz.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Facebook
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Twitter
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Set a title for this page
Contact.title = 'İletişim'; 