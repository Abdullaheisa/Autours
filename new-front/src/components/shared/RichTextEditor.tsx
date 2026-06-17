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
  Table,
  Image as ImageIcon,
  Code,
  Loader2,
} from 'lucide-react';
import { blogApi } from '@/services/api';
import toast from 'react-hot-toast';

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

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState('2');
  const [tableCols, setTableCols] = useState('2');

  const [isSourceMode, setIsSourceMode] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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
  }, [value, isSourceMode]);

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
    saveSelection();
    setLinkUrl('');
    setLinkModalOpen(true);
  };

  const submitLink = () => {
    if (linkUrl) {
      runCommand('createLink', linkUrl);
    }
    setLinkModalOpen(false);
  };

  const handleTable = () => {
    saveSelection();
    setTableRows('2');
    setTableCols('2');
    setTableModalOpen(true);
  };

  const submitTable = () => {
    if (tableRows && tableCols) {
      let tableHTML = '<br/><table border="1" style="width:100%; border-collapse: collapse; border: 1px solid #e5e7eb;"><tbody>';
      for (let i = 0; i < parseInt(tableRows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(tableCols); j++) {
          const isHeader = i === 0;
          const cellStyle = isHeader
            ? 'background-color: #f3f4f6; font-weight: bold; padding: 12px; border: 1px solid #e5e7eb; text-align: left;'
            : 'padding: 12px; border: 1px solid #e5e7eb;';
          const cellTag = isHeader ? 'th' : 'td';
          tableHTML += `<${cellTag} style="${cellStyle}">Cell</${cellTag}>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table><br/>';
      runCommand('insertHTML', tableHTML);
    }
    setTableModalOpen(false);
  };

  const handleImage = () => {
    saveSelection();
    setImageFile(null);
    setImageAlt('');
    setImageModalOpen(true);
  };

  const submitImage = async () => {
    if (imageFile) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response: any = await blogApi.uploadImage(formData);
        const url = response?.data?.url || response?.url;
        if (url) {
          const imgHTML = `<img src="${url}" alt="${imageAlt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`;
          runCommand('insertHTML', imgHTML);
          setImageModalOpen(false);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    } else {
      toast.error("Please select an image");
    }
  };

  const getBtnClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-colors disabled:opacity-40 ${isActive ? 'bg-primary text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
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
        <button
          type="button"
          className={getBtnClass(false)}
          title="Insert table"
          onMouseDown={(e) => handleToolbarMouseDown(e, handleTable)}
        >
          <Table size={14} />
        </button>
        <button
          type="button"
          className={getBtnClass(false)}
          title="Insert image"
          onMouseDown={(e) => handleToolbarMouseDown(e, handleImage)}
        >
          <ImageIcon size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          type="button"
          className={getBtnClass(isSourceMode)}
          title="Source Code"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsSourceMode(!isSourceMode);
          }}
        >
          <Code size={14} />
        </button>
      </div>

      {isSourceMode ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rich-text-editor__body w-full px-4 py-3 text-sm text-gray-900 focus:outline-none bg-gray-50 font-mono resize-y"
          style={{ minHeight }}
        />
      ) : (
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
      )}

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitLink();
                if (e.key === 'Escape') setLinkModalOpen(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setLinkModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
              <button onClick={submitLink} className="px-4 py-2 text-sm font-bold bg-primary text-gray-900 rounded-xl hover:bg-primary-600">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Insert Table</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitTable();
                    if (e.key === 'Escape') setTableModalOpen(false);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setTableModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
              <button onClick={submitTable} className="px-4 py-2 text-sm font-bold bg-primary text-gray-900 rounded-xl hover:bg-primary-600">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Upload Image</h3>
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-gray-900 hover:file:bg-primary/80"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !uploadingImage) submitImage();
                  if (e.key === 'Escape' && !uploadingImage) setImageModalOpen(false);
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button disabled={uploadingImage} onClick={() => setImageModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl disabled:opacity-50">Cancel</button>
              <button disabled={uploadingImage || !imageFile} onClick={submitImage} className="px-4 py-2 text-sm font-bold bg-primary text-gray-900 rounded-xl hover:bg-primary-600 flex items-center gap-2 disabled:opacity-50">
                {uploadingImage && <Loader2 size={14} className="animate-spin" />}
                {uploadingImage ? 'Uploading...' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
