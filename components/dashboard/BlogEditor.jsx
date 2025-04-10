import { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from './ImageUploader';

export function BlogEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  
  const handleImageUpload = (url) => {
    if (editorRef.current) {
      editorRef.current.insertContent(`<img src="${url}" alt="Blog görseli" />`);
      setShowImageUploader(false);
    }
  };

  // Set up the TinyMCE configuration
  const editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'codesample'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | codesample image customimage | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    setup: (editor) => {
      editorRef.current = editor;
      
      // Add custom button for image upload
      editor.ui.registry.addButton('customimage', {
        icon: 'image',
        tooltip: 'Bilgisayardan Resim Yükle',
        onAction: () => setShowImageUploader(true)
      });
    }
  };

  return (
    <>
      <div className="border rounded-md mb-1">
        {!process.env.NEXT_PUBLIC_TINYMCE_API_KEY ? (
          <div className="p-4 bg-yellow-50 rounded-md text-yellow-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">TinyMCE API anahtarı bulunamadı</p>
              <p className="text-sm mt-1">
                Editörü kullanabilmek için <code>.env.local</code> dosyasında <code>NEXT_PUBLIC_TINYMCE_API_KEY</code> 
                değişkenini tanımlamalısınız. API anahtarını almak için TinyMCE web sitesine kaydolun.
              </p>
            </div>
          </div>
        ) : (
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={editorConfig}
            value={value}
            onEditorChange={onChange}
            onInit={(evt, editor) => editorRef.current = editor}
          />
        )}
      </div>

      <Dialog open={showImageUploader} onOpenChange={setShowImageUploader}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resim Yükle</DialogTitle>
          </DialogHeader>
          <ImageUploader 
            onImageUploaded={handleImageUpload}
            buttonLabel="Editöre Ekle"
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 