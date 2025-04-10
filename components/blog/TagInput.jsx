'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Etiket giriş bileşeni
 * Etiket ekleme, silme ve otomatik tamamlama özellikleri
 * 
 * @param {Object} props - Bileşen props'ları
 * @param {Array} props.tags - Seçili etiketler dizisi
 * @param {Function} props.onChange - Değişim olayı işleyicisi
 * @param {Array} props.suggestions - Öneri etiketleri dizisi
 * @param {string} props.placeholder - Yer tutucu metin
 */
export default function TagInput({ 
  tags = [], 
  onChange, 
  suggestions = [], 
  placeholder = 'Etiket ekle...' 
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Input değiştiğinde önerileri filtrele
  useEffect(() => {
    if (input.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }
    
    const filtered = suggestions.filter(
      suggestion => suggestion.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [input, suggestions]);
  
  // Dışarı tıklandığında önerileri kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Etiket ekle
  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag !== '' && 
      !tags.includes(trimmedTag) && 
      trimmedTag.length >= 2
    ) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current.focus();
  };
  
  // Etiket kaldır
  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };
  
  // Enter tuşuyla etiket ekleme
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };
  
  // Öneri seçme
  const selectSuggestion = (suggestion) => {
    addTag(suggestion);
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-md border min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
        {/* Seçili etiketler */}
        {tags.map(tag => (
          <div 
            key={tag} 
            className="flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-800 rounded-md"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-green-700 hover:text-green-900 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {/* Etiket giriş alanı */}
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="w-full py-1 px-0 border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-muted-foreground bg-transparent"
          />
          
          {/* Öneriler */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg z-50"
            >
              <ul className="py-1">
                {filteredSuggestions.map(suggestion => (
                  <li 
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-1.5">
        Enter tuşu ile etiket ekleyin. Birden fazla etiket ekleyebilirsiniz.
      </p>
    </div>
  );
} 