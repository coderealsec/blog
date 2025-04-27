import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from './ImageUploader';

export function SimpleEditor({ value, onChange }) {
  const editorRef = useRef(null);
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
    if (editorRef.current) {
      editorRef.current.insertContent(`<img src="${url}" alt="Uploaded Image" />`);
      setShowImageUploader(false);
    }
  };

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={editorContent}
          value={editorContent}
          onEditorChange={(newContent) => handleChange(newContent)}
          init={{
            height: 320,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | link image code | help | uploadimage',
            setup: (editor) => {
              editor.ui.registry.addButton('uploadimage', {
                text: 'Resim Yükle',
                icon: 'image',
                onAction: () => setShowImageUploader(true)
              });
            },
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
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