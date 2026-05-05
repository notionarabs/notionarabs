'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useState, useEffect } from 'react';
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignRight,
    AlignCenter,
    AlignLeft,
    Upload
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const InputModal = ({ isOpen, onClose, onSubmit, title, placeholder, initialValue = '', type = 'text' }) => {
    const [value, setValue] = useState(initialValue);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useToast();

    // Reset value when modal opens with new initialValue
    useEffect(() => {
        setValue(initialValue);
        setFile(null);
        setIsLoading(false);
    }, [initialValue, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        try {
            if (type === 'file' && file) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await api.post('/upload/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    onSubmit(response.data.data.imageUrl);
                    onClose();
                }
            } else {
                onSubmit(value);
                onClose();
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('حدث خطأ أثناء رفع الصورة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlay-show" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-secondary rounded-xl shadow-xl w-full max-w-md p-6 z-50 animate-content-show border border-gray-100 dark:border-dark-card-border">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4 text-right">
                        {title}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            {type === 'file' ? (
                                <div className="space-y-2">
                                    <label className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-dark-card-border rounded-lg text-center cursor-pointer hover:border-primary-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            multiple={false}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-dark-text-secondary">
                                            <Upload className="w-8 h-8" />
                                            <span>{file ? file.name : 'اضغط لاختيار صورة'}</span>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-card-border bg-white dark:bg-dark-input-bg text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 outline-none transition-all text-right dir-rtl"
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || (type === 'file' && !file)}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        جاري الرفع...
                                    </>
                                ) : (
                                    'إضافة'
                                )}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const MenuBar = ({ editor }) => {
    const [modal, setModal] = useState({ isOpen: false, type: null, initialValue: '' });
    const [hasImage, setHasImage] = useState(false);

    // Check if editor content has an image
    useEffect(() => {
        if (!editor) return;

        const checkForImage = () => {
            const html = editor.getHTML();
            setHasImage(html.includes('<img'));
        };

        // Check on mount and whenever content updates
        checkForImage();
        editor.on('update', checkForImage);

        return () => {
            editor.off('update', checkForImage);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    const openModal = (type) => {
        let initialValue = '';
        if (type === 'link') {
            initialValue = editor.getAttributes('link').href || '';
        }
        setModal({ isOpen: true, type, initialValue });
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    const handleModalSubmit = (value) => {
        if (modal.type === 'link') {
            // cancelled or empty
            if (!value) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
            }
            // update link
            editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run();
        } else if (modal.type === 'image') {
            if (value) {
                editor.chain().focus().setImage({ src: value }).run();
            }
        }
    };

    return (
        <>
            <InputModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                title={modal.type === 'link' ? 'إضافة رابط' : 'رفع صورة'}
                placeholder={modal.type === 'link' ? 'https://example.com' : ''}
                initialValue={modal.initialValue}
                type={modal.type === 'image' ? 'file' : 'text'}
            />
            <div className="border-b border-gray-200 dark:border-dark-card-border p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-dark-secondary rounded-t-lg">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Bold"
                >
                    <Bold className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Italic"
                >
                    <Italic className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Heading 3"
                >
                    <Heading3 className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Bullet List"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-5 h-5" />
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                    type="button"
                    onClick={() => openModal('link')}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Link"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => openModal('image')}
                    disabled={hasImage}
                    className={`p-2 rounded transition-colors ${hasImage
                            ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    title={hasImage ? "تم إضافة صورة بالفعل (صورة واحدة فقط مسموحة)" : "Image"}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Align Right"
                >
                    <AlignRight className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Align Center"
                >
                    <AlignCenter className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700 text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                    title="Align Left"
                >
                    <AlignLeft className="w-5 h-5" />
                </button>
            </div>
        </>
    );
};

const RichTextEditor = ({ content, onChange, placeholder = 'اكتب تفاصيل المقال هنا...' }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'right',
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-accent-700 dark:text-dark-text-primary prose-p:leading-normal prose-p:my-2',
                dir: 'rtl',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="border border-gray-200 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-secondary overflow-hidden focus-within:ring-2 focus-within:ring-primary-200 dark:focus-within:ring-primary-900 transition-shadow">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
