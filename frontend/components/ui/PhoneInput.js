'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCountryFlag from 'react-country-flag';
import { ChevronDown } from 'lucide-react';

const countryOptions = [
    { name: 'Afghanistan', code: '+93', countryCode: 'AF' },
    { name: 'Albania', code: '+355', countryCode: 'AL' },
    { name: 'Algeria', code: '+213', countryCode: 'DZ' },
    { name: 'American Samoa', code: '+1-684', countryCode: 'AS' },
    { name: 'Andorra', code: '+376', countryCode: 'AD' },
    { name: 'Angola', code: '+244', countryCode: 'AO' },
    { name: 'Anguilla', code: '+1-264', countryCode: 'AI' },
    { name: 'Antarctica', code: '+672', countryCode: 'AQ' },
    { name: 'Antigua and Barbuda', code: '+1-268', countryCode: 'AG' },
    { name: 'Argentina', code: '+54', countryCode: 'AR' },
    { name: 'Armenia', code: '+374', countryCode: 'AM' },
    { name: 'Aruba', code: '+297', countryCode: 'AW' },
    { name: 'Australia', code: '+61', countryCode: 'AU' },
    { name: 'Austria', code: '+43', countryCode: 'AT' },
    { name: 'Azerbaijan', code: '+994', countryCode: 'AZ' },
    { name: 'Bahamas', code: '+1-242', countryCode: 'BS' },
    { name: 'Bahrain', code: '+973', countryCode: 'BH' },
    { name: 'Bangladesh', code: '+880', countryCode: 'BD' },
    { name: 'Barbados', code: '+1-246', countryCode: 'BB' },
    { name: 'Belarus', code: '+375', countryCode: 'BY' },
    { name: 'Belgium', code: '+32', countryCode: 'BE' },
    { name: 'Belize', code: '+501', countryCode: 'BZ' },
    { name: 'Benin', code: '+229', countryCode: 'BJ' },
    { name: 'Bermuda', code: '+1-441', countryCode: 'BM' },
    { name: 'Bhutan', code: '+975', countryCode: 'BT' },
    { name: 'Bolivia', code: '+591', countryCode: 'BO' },
    { name: 'Bosnia and Herzegovina', code: '+387', countryCode: 'BA' },
    { name: 'Botswana', code: '+267', countryCode: 'BW' },
    { name: 'Brazil', code: '+55', countryCode: 'BR' },
    { name: 'British Indian Ocean Territory', code: '+246', countryCode: 'IO' },
    { name: 'British Virgin Islands', code: '+1-284', countryCode: 'VG' },
    { name: 'Brunei', code: '+673', countryCode: 'BN' },
    { name: 'Bulgaria', code: '+359', countryCode: 'BG' },
    { name: 'Burkina Faso', code: '+226', countryCode: 'BF' },
    { name: 'Burundi', code: '+257', countryCode: 'BI' },
    { name: 'Cambodia', code: '+855', countryCode: 'KH' },
    { name: 'Cameroon', code: '+237', countryCode: 'CM' },
    { name: 'Canada', code: '+1', countryCode: 'CA' },
    { name: 'Cape Verde', code: '+238', countryCode: 'CV' },
    { name: 'Cayman Islands', code: '+1-345', countryCode: 'KY' },
    { name: 'Central African Republic', code: '+236', countryCode: 'CF' },
    { name: 'Chad', code: '+235', countryCode: 'TD' },
    { name: 'Chile', code: '+56', countryCode: 'CL' },
    { name: 'China', code: '+86', countryCode: 'CN' },
    { name: 'Christmas Island', code: '+61', countryCode: 'CX' },
    { name: 'Cocos Islands', code: '+61', countryCode: 'CC' },
    { name: 'Colombia', code: '+57', countryCode: 'CO' },
    { name: 'Comoros', code: '+269', countryCode: 'KM' },
    { name: 'Cook Islands', code: '+682', countryCode: 'CK' },
    { name: 'Costa Rica', code: '+506', countryCode: 'CR' },
    { name: 'Croatia', code: '+385', countryCode: 'HR' },
    { name: 'Cuba', code: '+53', countryCode: 'CU' },
    { name: 'Curacao', code: '+599', countryCode: 'CW' },
    { name: 'Cyprus', code: '+357', countryCode: 'CY' },
    { name: 'Czech Republic', code: '+420', countryCode: 'CZ' },
    { name: 'Democratic Republic of the Congo', code: '+243', countryCode: 'CD' },
    { name: 'Denmark', code: '+45', countryCode: 'DK' },
    { name: 'Djibouti', code: '+253', countryCode: 'DJ' },
    { name: 'Dominica', code: '+1-767', countryCode: 'DM' },
    { name: 'Dominican Republic', code: '+1-809, 1-829, 1-849', countryCode: 'DO' },
    { name: 'East Timor', code: '+670', countryCode: 'TL' },
    { name: 'Ecuador', code: '+593', countryCode: 'EC' },
    { name: 'Egypt', code: '+20', countryCode: 'EG' },
    { name: 'El Salvador', code: '+503', countryCode: 'SV' },
    { name: 'Equatorial Guinea', code: '+240', countryCode: 'GQ' },
    { name: 'Eritrea', code: '+291', countryCode: 'ER' },
    { name: 'Estonia', code: '+372', countryCode: 'EE' },
    { name: 'Ethiopia', code: '+251', countryCode: 'ET' },
    { name: 'Falkland Islands', code: '+500', countryCode: 'FK' },
    { name: 'Faroe Islands', code: '+298', countryCode: 'FO' },
    { name: 'Fiji', code: '+679', countryCode: 'FJ' },
    { name: 'Finland', code: '+358', countryCode: 'FI' },
    { name: 'France', code: '+33', countryCode: 'FR' },
    { name: 'French Polynesia', code: '+689', countryCode: 'PF' },
    { name: 'Gabon', code: '+241', countryCode: 'GA' },
    { name: 'Gambia', code: '+220', countryCode: 'GM' },
    { name: 'Georgia', code: '+995', countryCode: 'GE' },
    { name: 'Germany', code: '+49', countryCode: 'DE' },
    { name: 'Ghana', code: '+233', countryCode: 'GH' },
    { name: 'Gibraltar', code: '+350', countryCode: 'GI' },
    { name: 'Greece', code: '+30', countryCode: 'GR' },
    { name: 'Greenland', code: '+299', countryCode: 'GL' },
    { name: 'Grenada', code: '+1-473', countryCode: 'GD' },
    { name: 'Guam', code: '+1-671', countryCode: 'GU' },
    { name: 'Guatemala', code: '+502', countryCode: 'GT' },
    { name: 'Guernsey', code: '+44-1481', countryCode: 'GG' },
    { name: 'Guinea', code: '+224', countryCode: 'GN' },
    { name: 'Guinea-Bissau', code: '+245', countryCode: 'GW' },
    { name: 'Guyana', code: '+592', countryCode: 'GY' },
    { name: 'Haiti', code: '+509', countryCode: 'HT' },
    { name: 'Honduras', code: '+504', countryCode: 'HN' },
    { name: 'Hong Kong', code: '+852', countryCode: 'HK' },
    { name: 'Hungary', code: '+36', countryCode: 'HU' },
    { name: 'Iceland', code: '+354', countryCode: 'IS' },
    { name: 'India', code: '+91', countryCode: 'IN' },
    { name: 'Indonesia', code: '+62', countryCode: 'ID' },
    { name: 'Iran', code: '+98', countryCode: 'IR' },
    { name: 'Iraq', code: '+964', countryCode: 'IQ' },
    { name: 'Ireland', code: '+353', countryCode: 'IE' },
    { name: 'Isle of Man', code: '+44-1624', countryCode: 'IM' },
    { name: 'Israel', code: '+972', countryCode: 'IL' },
    { name: 'Italy', code: '+39', countryCode: 'IT' },
    { name: 'Ivory Coast', code: '+225', countryCode: 'CI' },
    { name: 'Jamaica', code: '+1-876', countryCode: 'JM' },
    { name: 'Japan', code: '+81', countryCode: 'JP' },
    { name: 'Jersey', code: '+44-1534', countryCode: 'JE' },
    { name: 'Jordan', code: '+962', countryCode: 'JO' },
    { name: 'Kazakhstan', code: '+7', countryCode: 'KZ' },
    { name: 'Kenya', code: '+254', countryCode: 'KE' },
    { name: 'Kiribati', code: '+686', countryCode: 'KI' },
    { name: 'Kosovo', code: '+383', countryCode: 'XK' },
    { name: 'Kuwait', code: '+965', countryCode: 'KW' },
    { name: 'Kyrgyzstan', code: '+996', countryCode: 'KG' },
    { name: 'Laos', code: '+856', countryCode: 'LA' },
    { name: 'Latvia', code: '+371', countryCode: 'LV' },
    { name: 'Lebanon', code: '+961', countryCode: 'LB' },
    { name: 'Lesotho', code: '+266', countryCode: 'LS' },
    { name: 'Liberia', code: '+231', countryCode: 'LR' },
    { name: 'Libya', code: '+218', countryCode: 'LY' },
    { name: 'Liechtenstein', code: '+423', countryCode: 'LI' },
    { name: 'Lithuania', code: '+370', countryCode: 'LT' },
    { name: 'Luxembourg', code: '+352', countryCode: 'LU' },
    { name: 'Macau', code: '+853', countryCode: 'MO' },
    { name: 'Macedonia', code: '+389', countryCode: 'MK' },
    { name: 'Madagascar', code: '+261', countryCode: 'MG' },
    { name: 'Malawi', code: '+265', countryCode: 'MW' },
    { name: 'Malaysia', code: '+60', countryCode: 'MY' },
    { name: 'Maldives', code: '+960', countryCode: 'MV' },
    { name: 'Mali', code: '+223', countryCode: 'ML' },
    { name: 'Malta', code: '+356', countryCode: 'MT' },
    { name: 'Marshall Islands', code: '+692', countryCode: 'MH' },
    { name: 'Mauritania', code: '+222', countryCode: 'MR' },
    { name: 'Mauritius', code: '+230', countryCode: 'MU' },
    { name: 'Mayotte', code: '+262', countryCode: 'YT' },
    { name: 'Mexico', code: '+52', countryCode: 'MX' },
    { name: 'Micronesia', code: '+691', countryCode: 'FM' },
    { name: 'Moldova', code: '+373', countryCode: 'MD' },
    { name: 'Monaco', code: '+377', countryCode: 'MC' },
    { name: 'Mongolia', code: '+976', countryCode: 'MN' },
    { name: 'Montenegro', code: '+382', countryCode: 'ME' },
    { name: 'Montserrat', code: '+1-664', countryCode: 'MS' },
    { name: 'Morocco', code: '+212', countryCode: 'MA' },
    { name: 'Mozambique', code: '+258', countryCode: 'MZ' },
    { name: 'Myanmar', code: '+95', countryCode: 'MM' },
    { name: 'Namibia', code: '+264', countryCode: 'NA' },
    { name: 'Nauru', code: '+674', countryCode: 'NR' },
    { name: 'Nepal', code: '+977', countryCode: 'NP' },
    { name: 'Netherlands', code: '+31', countryCode: 'NL' },
    { name: 'Netherlands Antilles', code: '+599', countryCode: 'AN' },
    { name: 'New Caledonia', code: '+687', countryCode: 'NC' },
    { name: 'New Zealand', code: '+64', countryCode: 'NZ' },
    { name: 'Nicaragua', code: '+505', countryCode: 'NI' },
    { name: 'Niger', code: '+227', countryCode: 'NE' },
    { name: 'Nigeria', code: '+234', countryCode: 'NG' },
    { name: 'Niue', code: '+683', countryCode: 'NU' },
    { name: 'North Korea', code: '+850', countryCode: 'KP' },
    { name: 'Northern Mariana Islands', code: '+1-670', countryCode: 'MP' },
    { name: 'Norway', code: '+47', countryCode: 'NO' },
    { name: 'Oman', code: '+968', countryCode: 'OM' },
    { name: 'Pakistan', code: '+92', countryCode: 'PK' },
    { name: 'Palau', code: '+680', countryCode: 'PW' },
    { name: 'Palestine', code: '+970', countryCode: 'PS' },
    { name: 'Panama', code: '+507', countryCode: 'PA' },
    { name: 'Papua New Guinea', code: '+675', countryCode: 'PG' },
    { name: 'Paraguay', code: '+595', countryCode: 'PY' },
    { name: 'Peru', code: '+51', countryCode: 'PE' },
    { name: 'Philippines', code: '+63', countryCode: 'PH' },
    { name: 'Pitcairn', code: '+64', countryCode: 'PN' },
    { name: 'Poland', code: '+48', countryCode: 'PL' },
    { name: 'Portugal', code: '+351', countryCode: 'PT' },
    { name: 'Puerto Rico', code: '+1-787, 1-939', countryCode: 'PR' },
    { name: 'Qatar', code: '+974', countryCode: 'QA' },
    { name: 'Republic of the Congo', code: '+242', countryCode: 'CG' },
    { name: 'Reunion', code: '+262', countryCode: 'RE' },
    { name: 'Romania', code: '+40', countryCode: 'RO' },
    { name: 'Russia', code: '+7', countryCode: 'RU' },
    { name: 'Rwanda', code: '+250', countryCode: 'RW' },
    { name: 'Saint Barthelemy', code: '+590', countryCode: 'BL' },
    { name: 'Saint Helena', code: '+290', countryCode: 'SH' },
    { name: 'Saint Kitts and Nevis', code: '+1-869', countryCode: 'KN' },
    { name: 'Saint Lucia', code: '+1-758', countryCode: 'LC' },
    { name: 'Saint Martin', code: '+590', countryCode: 'MF' },
    { name: 'Saint Pierre and Miquelon', code: '+508', countryCode: 'PM' },
    { name: 'Saint Vincent and the Grenadines', code: '+1-784', countryCode: 'VC' },
    { name: 'Samoa', code: '+685', countryCode: 'WS' },
    { name: 'San Marino', code: '+378', countryCode: 'SM' },
    { name: 'Sao Tome and Principe', code: '+239', countryCode: 'ST' },
    { name: 'Saudi Arabia', code: '+966', countryCode: 'SA' },
    { name: 'Senegal', code: '+221', countryCode: 'SN' },
    { name: 'Serbia', code: '+381', countryCode: 'RS' },
    { name: 'Seychelles', code: '+248', countryCode: 'SC' },
    { name: 'Sierra Leone', code: '+232', countryCode: 'SL' },
    { name: 'Singapore', code: '+65', countryCode: 'SG' },
    { name: 'Sint Maarten', code: '+1-721', countryCode: 'SX' },
    { name: 'Slovakia', code: '+421', countryCode: 'SK' },
    { name: 'Slovenia', code: '+386', countryCode: 'SI' },
    { name: 'Solomon Islands', code: '+677', countryCode: 'SB' },
    { name: 'Somalia', code: '+252', countryCode: 'SO' },
    { name: 'South Africa', code: '+27', countryCode: 'ZA' },
    { name: 'South Korea', code: '+82', countryCode: 'KR' },
    { name: 'South Sudan', code: '+211', countryCode: 'SS' },
    { name: 'Spain', code: '+34', countryCode: 'ES' },
    { name: 'Sri Lanka', code: '+94', countryCode: 'LK' },
    { name: 'Sudan', code: '+249', countryCode: 'SD' },
    { name: 'Suriname', code: '+597', countryCode: 'SR' },
    { name: 'Svalbard and Jan Mayen', code: '+47', countryCode: 'SJ' },
    { name: 'Swaziland', code: '+268', countryCode: 'SZ' },
    { name: 'Sweden', code: '+46', countryCode: 'SE' },
    { name: 'Switzerland', code: '+41', countryCode: 'CH' },
    { name: 'Syria', code: '+963', countryCode: 'SY' },
    { name: 'Taiwan', code: '+886', countryCode: 'TW' },
    { name: 'Tajikistan', code: '+992', countryCode: 'TJ' },
    { name: 'Tanzania', code: '+255', countryCode: 'TZ' },
    { name: 'Thailand', code: '+66', countryCode: 'TH' },
    { name: 'Togo', code: '+228', countryCode: 'TG' },
    { name: 'Tokelau', code: '+690', countryCode: 'TK' },
    { name: 'Tonga', code: '+676', countryCode: 'TO' },
    { name: 'Trinidad and Tobago', code: '+1-868', countryCode: 'TT' },
    { name: 'Tunisia', code: '+216', countryCode: 'TN' },
    { name: 'Turkey', code: '+90', countryCode: 'TR' },
    { name: 'Turkmenistan', code: '+993', countryCode: 'TM' },
    { name: 'Turks and Caicos Islands', code: '+1-649', countryCode: 'TC' },
    { name: 'Tuvalu', code: '+688', countryCode: 'TV' },
    { name: 'U.S. Virgin Islands', code: '+1-340', countryCode: 'VI' },
    { name: 'Uganda', code: '+256', countryCode: 'UG' },
    { name: 'Ukraine', code: '+380', countryCode: 'UA' },
    { name: 'United Arab Emirates', code: '+971', countryCode: 'AE' },
    { name: 'United Kingdom', code: '+44', countryCode: 'GB' },
    { name: 'United States', code: '+1', countryCode: 'US' },
    { name: 'Uruguay', code: '+598', countryCode: 'UY' },
    { name: 'Uzbekistan', code: '+998', countryCode: 'UZ' },
    { name: 'Vanuatu', code: '+678', countryCode: 'VU' },
    { name: 'Vatican', code: '+379', countryCode: 'VA' },
    { name: 'Venezuela', code: '+58', countryCode: 'VE' },
    { name: 'Vietnam', code: '+84', countryCode: 'VN' },
    { name: 'Wallis and Futuna', code: '+681', countryCode: 'WF' },
    { name: 'Western Sahara', code: '+212', countryCode: 'EH' },
    { name: 'Yemen', code: '+967', countryCode: 'YE' },
    { name: 'Zambia', code: '+260', countryCode: 'ZM' },
    { name: 'Zimbabwe', code: '+263', countryCode: 'ZW' }
];

export default function PhoneInput({
    value,
    onChange,
    countryCode,
    onCountryChange,
    placeholder = "100 000 0000",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectedCountry = countryOptions.find(c => c.code === countryCode) || countryOptions[0];

    const filteredCountryOptions = countryOptions.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery)
    );

    const updateDropdownPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            setDropdownPosition({
                top: rect.bottom + scrollY + 4, // 4px gap
                left: rect.left + scrollX,
                width: 320 // fixed wider width for search readability
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            window.addEventListener('resize', updateDropdownPosition);
            // Scroll listener removed as absolute positioning handles page scroll naturally
        }
        return () => {
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is inside button (to toggle) or inside dropdown portal (to keep open)
            const isClickInsideButton = buttonRef.current && buttonRef.current.contains(event.target);
            const isClickInsideDropdown = event.target.closest('.phone-input-dropdown');

            if (!isClickInsideButton && !isClickInsideDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Phone Number Input */}
            <input
                type="tel"
                dir="ltr"
                value={value}
                onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    onChange(numericValue);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all text-right placeholder:text-gray-400 dark:placeholder:text-gray-600 dark:text-gray-200"
                placeholder={placeholder}
            />

            {/* Country Dropdown Button */}
            <div className="relative w-32 shrink-0">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="w-full h-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 transition-all flex items-center justify-between text-sm"
                >
                    <div className="flex items-center gap-2">
                        <ReactCountryFlag
                            countryCode={selectedCountry.countryCode}
                            svg
                            style={{ width: '1.2em', height: '1.2em' }}
                        />
                        <span className="dir-ltr text-gray-700 dark:text-gray-300">{selectedCountry.code}</span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Portal for Dropdown Content */}
                {isOpen && typeof document !== 'undefined' && createPortal(
                    <div
                        className="phone-input-dropdown absolute z-[9999] bg-white dark:bg-dark-card-bg shadow-2xl rounded-xl max-h-80 overflow-y-auto border border-gray-100 dark:border-dark-card-border flex flex-col"
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: '300px' // Wider than button for better usability
                        }}
                    >
                        <div className="p-2 sticky top-0 bg-white dark:bg-dark-card-bg z-10 border-b border-gray-100 dark:border-dark-card-border">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:ring-2 focus:ring-primary-500 outline-none text-right dir-rtl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto">
                            {filteredCountryOptions.length > 0 ? (
                                filteredCountryOptions.map((country) => (
                                    <button
                                        key={`${country.code}-${country.countryCode}`}
                                        type="button"
                                        onClick={() => {
                                            onCountryChange(country.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary flex items-center justify-between gap-3 text-sm transition-colors
                    ${country.code === countryCode ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600' : 'text-gray-700 dark:text-gray-300'}
                    `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <ReactCountryFlag
                                                countryCode={country.countryCode}
                                                svg
                                                style={{ width: '1.2em', height: '1.2em', flexShrink: 0 }}
                                            />
                                            <span className="truncate">{country.name}</span>
                                        </div>
                                        <span className="text-gray-400 dir-ltr font-mono">{country.code}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">No countries found</div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
