import { useState, useRef, useMemo, useEffect } from 'react';
import { templateCategories } from '../lib/templateCategories';

export default function CategorySelector({ selectedCategories, onAddCategory, onRemoveCategory }) {
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryDropdownRef = useRef(null);
    const categoryInputRef = useRef(null);

    // Filter categories based on search
    const filteredCategories = useMemo(() => templateCategories.filter(category =>
        category.toLowerCase().includes(categorySearch.toLowerCase())
    ), [categorySearch]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCategorySearch = (e) => {
        setCategorySearch(e.target.value);
        setShowCategoryDropdown(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowCategoryDropdown(false);
            setCategorySearch('');
        }
    };

    const handleAddCategory = (category) => {
        onAddCategory(category);
        setCategorySearch('');
        // Keep dropdown open for multiple selections
    };

    return (
        <div className="relative">
            <div className="form-input w-full min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 dark:border-dark-input-border focus-within:border-primary-500 dark:focus-within:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Selected Categories Inside Input */}
                {selectedCategories.map((category, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs sm:text-sm font-medium"
                    >
                        {category}
                        <button
                            type="button"
                            onClick={() => onRemoveCategory(category)}
                            className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                        >
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}

                {/* Search Input */}
                <input
                    ref={categoryInputRef}
                    type="text"
                    value={categorySearch}
                    onChange={handleCategorySearch}
                    onFocus={() => selectedCategories.length < 3 && setShowCategoryDropdown(true)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setTimeout(() => setShowCategoryDropdown(false), 200);
                    }}
                    placeholder={
                        selectedCategories.length >= 3
                            ? "تم الوصول للحد الأقصى (3 فئات)"
                            : selectedCategories.length > 0
                                ? "أضف فئة أخرى..."
                                : "ابحث عن الفئة..."
                    }
                    disabled={selectedCategories.length >= 3}
                    className="flex-1 min-w-[100px] sm:min-w-[120px] bg-transparent outline-none text-sm sm:text-base text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="off"
                />
            </div>

            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Dropdown */}
            {showCategoryDropdown && selectedCategories.length < 3 && (
                <div ref={categoryDropdownRef} className="absolute z-[9999] w-full mt-2 bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-card-border rounded-lg sm:rounded-xl shadow-2xl max-h-48 sm:max-h-64 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleAddCategory(category)}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={selectedCategories.includes(category)}
                                className="w-full text-right px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary text-sm sm:text-base text-gray-900 dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-gray-100 dark:border-dark-card-border last:border-b-0"
                            >
                                <div className="flex items-center justify-between">
                                    <span>{category}</span>
                                    {selectedCategories.includes(category) && (
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-3 sm:px-4 py-4 sm:py-6 text-gray-500 dark:text-dark-text-tertiary text-center text-sm sm:text-base">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            لا توجد فئات مطابقة
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
