import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from './ImageUploader';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Code, AlignLeft, AlignCenter, AlignRight, Link2 as LinkIcon, Image } from 'lucide-react';

export function BasicEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  
  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    
    // Editör içeriğini güncelleyelim
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    
    // Editöre odaklanalım
    editorRef.current?.focus();
  };
  
  const handleLinkClick = () => {
    const url = prompt('Bağlantı URL\'sini girin:', 'https://');
    if (url) {
      handleCommand('createLink', url);
    }
  };
  
  const handleImageUpload = (url) => {
    const img = `<img src="${url}" alt="Blog görseli" style="max-width: 100%; height: auto;" />`;
    document.execCommand('insertHTML', false, img);
    
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    
    setShowImageUploader(false);
  };
  
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b p-1 flex flex-wrap gap-1">
          <ToolbarButton onClick={() => handleCommand('bold')} title="Kalın">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('italic')} title="İtalik">
            <Italic size={16} />
          </ToolbarButton>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <ToolbarButton onClick={() => handleCommand('insertUnorderedList')} title="Sırasız Liste">
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('insertOrderedList')} title="Sıralı Liste">
            <ListOrdered size={16} />
          </ToolbarButton>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <ToolbarButton onClick={() => handleCommand('formatBlock', '<h2>')} title="Başlık">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('formatBlock', '<h3>')} title="Alt Başlık">
            H3
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('formatBlock', '<pre>')} title="Kod Bloğu">
            <Code size={16} />
          </ToolbarButton>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <ToolbarButton onClick={() => handleCommand('justifyLeft')} title="Sola Hizala">
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('justifyCenter')} title="Ortala">
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => handleCommand('justifyRight')} title="Sağa Hizala">
            <AlignRight size={16} />
          </ToolbarButton>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <ToolbarButton onClick={handleLinkClick} title="Bağlantı Ekle">
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowImageUploader(true)} title="Resim Ekle">
            <Image size={16} />
          </ToolbarButton>
        </div>
        
        <div
          ref={editorRef}
          className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto"
          contentEditable
          dangerouslySetInnerHTML={{ __html: value || '' }}
          onInput={handleInput}
          style={{ outline: 'none' }}
        />
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

// Editör araç çubuğu butonu bileşeni
function ToolbarButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      className="p-1.5 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
} 