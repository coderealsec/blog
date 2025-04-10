'use client';

import { useRef, useState } from 'react';
import { Editor as TinyMCE } from '@tinymce/tinymce-react';

/**
 * Zengin metin editörü bileşeni
 * TinyMCE entegrasyonu
 * 
 * @param {Object} props - Bileşen props'ları
 * @param {string} props.value - İçerik değeri
 * @param {Function} props.onChange - Değişim olayı işleyicisi
 * @param {number} props.height - Editör yüksekliği
 * @param {string} props.placeholder - Yer tutucu metin
 */
export default function Editor({ 
  value, 
  onChange, 
  height = 500, 
  placeholder = 'İçeriğinizi buraya yazın...' 
}) {
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  return (
    <div className="rounded-md border">
      <TinyMCE
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setIsInitialized(true);
        }}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
            'emoticons', 'codesample'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | image media link codesample | emoticons | code',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }',
          placeholder,
          branding: false,
          promotion: false,
          language: 'tr_TR',
          codesample_languages: [
            { text: 'HTML/XML', value: 'markup' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'CSS', value: 'css' },
            { text: 'PHP', value: 'php' },
            { text: 'Ruby', value: 'ruby' },
            { text: 'Python', value: 'python' },
            { text: 'Java', value: 'java' },
            { text: 'C', value: 'c' },
            { text: 'C#', value: 'csharp' },
            { text: 'C++', value: 'cpp' },
            { text: 'Bash', value: 'bash' },
            { text: 'SQL', value: 'sql' },
            { text: 'JSON', value: 'json' }
          ],
          file_picker_callback: function(callback, value, meta) {
            // Özel dosya seçme fonksiyonu burada tanımlanabilir
            // Şimdilik normal dosya seçiciyi kullanıyoruz
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            
            if (meta.filetype === 'image') {
              input.setAttribute('accept', 'image/*');
            }
            
            input.onchange = function() {
              const file = this.files[0];
              // Burada dosya yükleme işlemi yapılabilir
              // Şu an için boş bırakıyoruz
            };
            
            input.click();
          },
          setup: function(editor) {
            editor.on('init', function(e) {
              if (value === '') {
                editor.setContent('');
              }
            });
          }
        }}
      />
    </div>
  );
} 