import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from './ImageUploader';

// React-Quill'i dinamik olarak import ediyoruz çünkü server-side rendering ile uyumlu değil
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-md border">Editör yükleniyor...</div>
});

export function SimpleEditor({ value, onChange }) {
  const quillRef = useRef(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [editorContent, setEditorContent] = useState(value || '');
  
  // Dışarıdan gelen value değerini state'e senkronize ediyoruz
  useEffect(() => {
    if (value !== editorContent) {
      setEditorContent(value);
    }
  }, [value]);

  // İçerik değiştiğinde parent componente bildiriyoruz
  const handleChange = (content) => {
    setEditorContent(content);
    if (onChange) {
      onChange(content);
    }
  };

  // Resim yükleme işleyicisi
  const handleImageUpload = (url) => {
    if (quillRef.current) {
      // Editördeki konumu alıyoruz
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      
      // Eğer seçili bir alan varsa, o konuma resmi ekliyoruz
      if (range) {
        editor.insertEmbed(range.index, 'image', url);
      } else {
        // Seçili alan yoksa, sona ekliyoruz
        editor.insertEmbed(editor.getLength(), 'image', url);
      }
      
      setShowImageUploader(false);
    }
  };

  // Quill editör modülleri ve formatları
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'code-block'],
        ['clean'],
        ['uploadimage']
      ],
      handlers: {
        'uploadimage': () => setShowImageUploader(true)
      }
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image', 'code-block'
  ];

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorContent}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="İçeriğinizi buraya yazın..."
          className="h-80"
        />
        <div className="px-3 py-2 text-xs text-gray-500 border-t">
          <span>⚡ Editör araç çubuğundaki resim ikonuna tıklayarak veya </span>
          <button 
            onClick={() => setShowImageUploader(true)}
            className="text-blue-600 hover:underline"
            type="button"
          >
            buraya tıklayarak
          </button>
          <span> resim yükleyebilirsiniz.</span>
        </div>
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