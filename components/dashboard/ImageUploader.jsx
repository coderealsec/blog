import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';

export function ImageUploader({ onImageUploaded, buttonLabel = "Resim Yükle" }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Sadece JPEG, PNG, GIF ve WebP formatları desteklenmektedir.");
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog');
      
      const response = await fetch('/api/uploads/images', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Resim yükleme başarısız');
      }
      
      const data = await response.json();
      
      if (data.success && data.file.url) {
        setUploadedUrl(data.file.url);
        if (onImageUploaded) {
          onImageUploaded(data.file.url);
        }
      } else {
        throw new Error('Resim URL bilgisi alınamadı');
      }
    } catch (err) {
      console.error('Resim yükleme hatası:', err);
      setError(err.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-200 text-red-600 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {uploadedUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-600">Resim başarıyla yüklendi!</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4 mr-1" />
                Temizle
              </Button>
            </div>
            <div className="border rounded-md p-2 bg-gray-50">
              <img 
                src={uploadedUrl} 
                alt="Uploaded" 
                className="max-h-52 object-contain mx-auto"
              />
            </div>
            <Input 
              value={uploadedUrl} 
              readOnly 
              className="bg-gray-50 mt-2"
              onClick={(e) => e.target.select()}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="image">Yüklenecek resmi seçin</Label>
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPEG, PNG, GIF, WebP
              </p>
            </div>
            
            {preview && (
              <div className="border rounded-md p-2 bg-gray-50">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-52 object-contain mx-auto"
                />
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-2">
              {file && (
                <Button variant="ghost" size="sm" onClick={resetUpload}>
                  <X className="h-4 w-4 mr-1" />
                  İptal
                </Button>
              )}
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    {buttonLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 