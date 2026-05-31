'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  id?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = 200,
  className = '',
  id,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // States for active formatting
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range;
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!savedRangeRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, []);

  const checkActiveFormats = useCallback(() => {
    saveSelection();
    if (document.activeElement !== editorRef.current) return;
    
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  }, [saveSelection]);

  useEffect(() => {
    document.addEventListener('selectionchange', checkActiveFormats);
    return () => {
      document.removeEventListener('selectionchange', checkActiveFormats);
    };
  }, [checkActiveFormats]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || document.activeElement === el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const syncContent = useCallback(() => {
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const runCommand = (command: string, commandValue?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    syncContent();
    checkActiveFormats();
  };

  const handleToolbarMouseDown = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  const handleFormatBlock = (tag: string) => {
    runCommand('formatBlock', tag);
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL');
    if (url) runCommand('createLink', url);
  };

  const getBtnClass = (isActive: boolean) => 
    `p-2 rounded-lg transition-colors disabled:opacity-40 ${
      isActive ? 'bg-primary text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className={`rich-text-editor border border-gray-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      <div className="bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-1 border-b border-gray-200">
        <select
          className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 cursor-pointer font-medium"
          defaultValue="p"
          onChange={(e) => handleFormatBlock(e.target.value)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 cursor-pointer font-medium max-w-[120px]"
          defaultValue="Arial"
          onChange={(e) => runCommand('fontName', e.target.value)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <option value="Arial">Arial</option>
          <option value="Inter">Inter</option>
          <option value="Outfit">Outfit</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier</option>
          <option value="Tahoma">Tahoma</option>
        </select>

        <select
          className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 cursor-pointer font-medium max-w-[110px]"
          defaultValue="3"
          onChange={(e) => runCommand('fontSize', e.target.value)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
        </select>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          type="button"
          className={getBtnClass(activeFormats.bold)}
          title="Bold"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('bold'))}
        >
          <Bold size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className={getBtnClass(activeFormats.italic)}
          title="Italic"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('italic'))}
        >
          <Italic size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className={getBtnClass(activeFormats.underline)}
          title="Underline"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('underline'))}
        >
          <Underline size={14} strokeWidth={2.5} />
        </button>

        <label
          className={`${getBtnClass(false)} cursor-pointer flex items-center`}
          title="Text color"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="text-xs font-black">A</span>
          <input
            type="color"
            className="sr-only"
            defaultValue="#111827"
            onChange={(e) => runCommand('foreColor', e.target.value)}
          />
        </label>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          type="button"
          className={getBtnClass(activeFormats.justifyLeft)}
          title="Align left"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('justifyLeft'))}
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          className={getBtnClass(activeFormats.justifyCenter)}
          title="Align center"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('justifyCenter'))}
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          className={getBtnClass(activeFormats.justifyRight)}
          title="Align right"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('justifyRight'))}
        >
          <AlignRight size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          type="button"
          className={getBtnClass(activeFormats.insertUnorderedList)}
          title="Bullet list"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('insertUnorderedList'))}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          className={getBtnClass(activeFormats.insertOrderedList)}
          title="Numbered list"
          onMouseDown={(e) => handleToolbarMouseDown(e, () => runCommand('insertOrderedList'))}
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          className={getBtnClass(false)}
          title="Insert link"
          onMouseDown={(e) => handleToolbarMouseDown(e, handleLink)}
        >
          <Link2 size={14} />
        </button>
      </div>

      <div
        id={id}
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        suppressContentEditableWarning
        onInput={() => { syncContent(); checkActiveFormats(); }}
        onKeyUp={checkActiveFormats}
        onMouseUp={checkActiveFormats}
        onBlur={syncContent}
        data-placeholder={placeholder}
        className="rich-text-editor__body w-full px-4 py-3 text-sm text-gray-900 focus:outline-none bg-white"
        style={{ minHeight }}
      />
    </div>
  );
}
