import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Undo2, Redo2 } from 'lucide-react';
import { useEffect } from 'react';
import { sanitizeHtml } from '../../lib/sanitize';

function ToolbarButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-[#EDE9FF] text-[#7C6AF7]' : 'text-[#1A1A2E]/70 hover:bg-[#F5F4F2]'}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Ссылка (https://...)', prev ?? 'https://');
    if (url === null) return;
    if (!url || url === 'https://') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  const i = 'w-4 h-4';
  return (
    <div className="flex flex-wrap gap-0.5 border-b border-[#1A1A2E]/10 p-1.5">
      <ToolbarButton label="Жирный" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className={i} /></ToolbarButton>
      <ToolbarButton label="Курсив" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className={i} /></ToolbarButton>
      <ToolbarButton label="Заголовок" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className={i} /></ToolbarButton>
      <ToolbarButton label="Подзаголовок" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className={i} /></ToolbarButton>
      <ToolbarButton label="Список" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className={i} /></ToolbarButton>
      <ToolbarButton label="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className={i} /></ToolbarButton>
      <ToolbarButton label="Цитата" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className={i} /></ToolbarButton>
      <ToolbarButton label="Ссылка" active={editor.isActive('link')} onClick={setLink}><Link2 className={i} /></ToolbarButton>
      <span className="flex-1" />
      <ToolbarButton label="Отменить" onClick={() => editor.chain().focus().undo().run()}><Undo2 className={i} /></ToolbarButton>
      <ToolbarButton label="Повторить" onClick={() => editor.chain().focus().redo().run()}><Redo2 className={i} /></ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'Текст урока…' }),
    ],
    content: sanitizeHtml(value || ''),
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
    editorProps: { attributes: { class: 'lesson-content min-h-[200px] max-h-[50vh] overflow-y-auto px-4 py-3 focus:outline-none' } },
  });

  // Внешняя смена значения (открыли другой урок)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === '' && editor.isEmpty)) {
      editor.commands.setContent(sanitizeHtml(value || ''), false);
    }
  }, [value, editor]);

  if (!editor) return null;
  return (
    <div className="rounded-xl border border-[#1A1A2E]/10 bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
