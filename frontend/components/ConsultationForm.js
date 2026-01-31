'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCountryFlag from 'react-country-flag';
import { getApiBaseUrl } from '../lib/apiConfig';

const initialFormState = {
  name: '',
  email: '',
  whatsapp: '',
  countryCode: '+20',
  companyType: '',
  teamSize: '',
  role: '',
  projectHelp: '',
  companyName: '',
  budget: '',
  timeline: '',
  companyWebsite: '',
  serviceType: [],
  details: '',
  source: 'website-contact'
};

const countryOptions = [
  { name: 'Afghanistan', code: '+93', countryCode: 'AF' },
  { name: 'Albania', code: '+355', countryCode: 'AL' },
  { name: 'Algeria', code: '+213', countryCode: 'DZ' },
  { name: 'American Samoa', code: '+1', countryCode: 'AS' },
  { name: 'Andorra', code: '+376', countryCode: 'AD' },
  { name: 'Angola', code: '+244', countryCode: 'AO' },
  { name: 'Anguilla', code: '+1', countryCode: 'AI' },
  { name: 'Antarctica', code: '+672', countryCode: 'AQ' },
  { name: 'Antigua and Barbuda', code: '+1', countryCode: 'AG' },
  { name: 'Argentina', code: '+54', countryCode: 'AR' },
  { name: 'Armenia', code: '+374', countryCode: 'AM' },
  { name: 'Aruba', code: '+297', countryCode: 'AW' },
  { name: 'Australia', code: '+61', countryCode: 'AU' },
  { name: 'Austria', code: '+43', countryCode: 'AT' },
  { name: 'Azerbaijan', code: '+994', countryCode: 'AZ' },
  { name: 'Bahamas', code: '+1', countryCode: 'BS' },
  { name: 'Bahrain', code: '+973', countryCode: 'BH' },
  { name: 'Bangladesh', code: '+880', countryCode: 'BD' },
  { name: 'Barbados', code: '+1', countryCode: 'BB' },
  { name: 'Belarus', code: '+375', countryCode: 'BY' },
  { name: 'Belgium', code: '+32', countryCode: 'BE' },
  { name: 'Belize', code: '+501', countryCode: 'BZ' },
  { name: 'Benin', code: '+229', countryCode: 'BJ' },
  { name: 'Bermuda', code: '+1', countryCode: 'BM' },
  { name: 'Bhutan', code: '+975', countryCode: 'BT' },
  { name: 'Bolivia', code: '+591', countryCode: 'BO' },
  { name: 'Bosnia and Herzegovina', code: '+387', countryCode: 'BA' },
  { name: 'Botswana', code: '+267', countryCode: 'BW' },
  { name: 'Brazil', code: '+55', countryCode: 'BR' },
  { name: 'British Indian Ocean Territory', code: '+246', countryCode: 'IO' },
  { name: 'British Virgin Islands', code: '+1', countryCode: 'VG' },
  { name: 'Brunei', code: '+673', countryCode: 'BN' },
  { name: 'Bulgaria', code: '+359', countryCode: 'BG' },
  { name: 'Burkina Faso', code: '+226', countryCode: 'BF' },
  { name: 'Burundi', code: '+257', countryCode: 'BI' },
  { name: 'Cambodia', code: '+855', countryCode: 'KH' },
  { name: 'Cameroon', code: '+237', countryCode: 'CM' },
  { name: 'Canada', code: '+1', countryCode: 'CA' },
  { name: 'Cape Verde', code: '+238', countryCode: 'CV' },
  { name: 'Cayman Islands', code: '+1', countryCode: 'KY' },
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
  { name: 'Dominica', code: '+1', countryCode: 'DM' },
  { name: 'Dominican Republic', code: '+1', countryCode: 'DO' },
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
  { name: 'Grenada', code: '+1', countryCode: 'GD' },
  { name: 'Guam', code: '+1', countryCode: 'GU' },
  { name: 'Guatemala', code: '+502', countryCode: 'GT' },
  { name: 'Guernsey', code: '+44', countryCode: 'GG' },
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
  { name: 'Isle of Man', code: '+44', countryCode: 'IM' },
  { name: 'Israel', code: '+972', countryCode: 'IL' },
  { name: 'Italy', code: '+39', countryCode: 'IT' },
  { name: 'Ivory Coast', code: '+225', countryCode: 'CI' },
  { name: 'Jamaica', code: '+1', countryCode: 'JM' },
  { name: 'Japan', code: '+81', countryCode: 'JP' },
  { name: 'Jersey', code: '+44', countryCode: 'JE' },
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
  { name: 'Montserrat', code: '+1', countryCode: 'MS' },
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
  { name: 'Norfolk Island', code: '+672', countryCode: 'NF' },
  { name: 'North Korea', code: '+850', countryCode: 'KP' },
  { name: 'Northern Mariana Islands', code: '+1', countryCode: 'MP' },
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
  { name: 'Puerto Rico', code: '+1', countryCode: 'PR' },
  { name: 'Qatar', code: '+974', countryCode: 'QA' },
  { name: 'Republic of the Congo', code: '+242', countryCode: 'CG' },
  { name: 'Reunion', code: '+262', countryCode: 'RE' },
  { name: 'Romania', code: '+40', countryCode: 'RO' },
  { name: 'Russia', code: '+7', countryCode: 'RU' },
  { name: 'Rwanda', code: '+250', countryCode: 'RW' },
  { name: 'Saint Barthelemy', code: '+590', countryCode: 'BL' },
  { name: 'Saint Helena', code: '+290', countryCode: 'SH' },
  { name: 'Saint Kitts and Nevis', code: '+1', countryCode: 'KN' },
  { name: 'Saint Lucia', code: '+1', countryCode: 'LC' },
  { name: 'Saint Martin', code: '+590', countryCode: 'MF' },
  { name: 'Saint Pierre and Miquelon', code: '+508', countryCode: 'PM' },
  { name: 'Saint Vincent and the Grenadines', code: '+1', countryCode: 'VC' },
  { name: 'Samoa', code: '+685', countryCode: 'WS' },
  { name: 'San Marino', code: '+378', countryCode: 'SM' },
  { name: 'Sao Tome and Principe', code: '+239', countryCode: 'ST' },
  { name: 'Saudi Arabia', code: '+966', countryCode: 'SA' },
  { name: 'Senegal', code: '+221', countryCode: 'SN' },
  { name: 'Serbia', code: '+381', countryCode: 'RS' },
  { name: 'Seychelles', code: '+248', countryCode: 'SC' },
  { name: 'Sierra Leone', code: '+232', countryCode: 'SL' },
  { name: 'Singapore', code: '+65', countryCode: 'SG' },
  { name: 'Sint Maarten', code: '+1', countryCode: 'SX' },
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
  { name: 'Trinidad and Tobago', code: '+1', countryCode: 'TT' },
  { name: 'Tunisia', code: '+216', countryCode: 'TN' },
  { name: 'Turkey', code: '+90', countryCode: 'TR' },
  { name: 'Turkmenistan', code: '+993', countryCode: 'TM' },
  { name: 'Turks and Caicos Islands', code: '+1', countryCode: 'TC' },
  { name: 'Tuvalu', code: '+688', countryCode: 'TV' },
  { name: 'U.S. Virgin Islands', code: '+1', countryCode: 'VI' },
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

function DropdownSelect({ label, name, value, onChange, options, placeholder, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({ name, value: optionValue });
    setIsOpen(false);
  };

  return (
    <div className="form-group relative" ref={dropdownRef}>
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
        {label}
        {required && <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>}
      </label>
      <button
        type="button"
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl text-right flex items-center justify-between gap-3 transition-colors duration-200 ${isOpen
          ? 'border-primary-500 ring-2 ring-primary-500'
          : 'border-gray-200 dark:border-dark-input-border'
          } bg-white dark:bg-dark-secondary`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={selectedOption ? 'text-accent-700 dark:text-dark-text-primary' : 'text-gray-400 dark:text-dark-text-tertiary'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-right px-4 py-2 text-sm transition-colors ${option.value === value
                ? 'bg-primary-50 text-primary-600 dark:bg-orange-500/10 dark:text-orange-300'
                : 'text-accent-600 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {required && !value && (
        <input type="text" name={name} value="" required className="sr-only" readOnly />
      )}
    </div>
  );
}

function MultiSelectDropdown({ label, name, values, onChange, options, placeholder, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleOption = (optionValue) => {
    const nextValues = values.includes(optionValue)
      ? values.filter((item) => item !== optionValue)
      : [...values, optionValue];
    onChange({ name, value: nextValues });
  };

  return (
    <div className="form-group relative" ref={dropdownRef}>
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
        {label}
        {required && <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>}
      </label>
      <button
        type="button"
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl text-right flex items-center justify-between gap-3 transition-colors duration-200 ${isOpen
          ? 'border-primary-500 ring-2 ring-primary-500'
          : 'border-gray-200 dark:border-dark-input-border'
          } bg-white dark:bg-dark-secondary`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={values.length ? 'text-accent-700 dark:text-dark-text-primary' : 'text-gray-400 dark:text-dark-text-tertiary'}>
          {values.length ? values.join('، ') : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg"
        >
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleOption(option.value)}
                className={`w-full text-right px-4 py-2 text-sm transition-colors flex items-center justify-between ${isSelected
                  ? 'bg-primary-50 text-primary-600 dark:bg-orange-500/10 dark:text-orange-300'
                  : 'text-accent-600 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                  }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
      {required && values.length === 0 && (
        <input type="text" name={name} value="" required className="sr-only" readOnly />
      )}
    </div>
  );
}

export default function ConsultationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const apiBaseUrl = getApiBaseUrl();
  const totalSteps = formData.companyType === 'Individual' ? 2 : 3;
  const phonePattern = /^\+?[0-9][0-9\s()-]{7,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formatWhatsappNumber = (countryCode, number) =>
    `${countryCode} ${number}`.replace(/\s+/g, ' ').trim();
  const isValidWhatsApp = (number, countryCode) =>
    phonePattern.test(formatWhatsappNumber(countryCode, number));
  const isValidUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }
    const normalized = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(normalized);
      if (!parsed.hostname || parsed.hostname.startsWith('.') || parsed.hostname.endsWith('.')) {
        return false;
      }
      if (parsed.hostname.includes('..')) {
        return false;
      }
      // Must contain at least one dot and a valid TLD length
      const parts = parsed.hostname.split('.');
      const tld = parts[parts.length - 1];
      return parts.length >= 2 && /^[a-z]{2,}$/i.test(tld);
    } catch {
      return false;
    }
  };
  const selectedCountry =
    countryOptions.find((country) => country.code === formData.countryCode)
    || countryOptions.find((country) => country.code === '+20');

  useEffect(() => {
    setErrors({});
  }, [step, formData.companyType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target ?? event;
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _ignored, ...rest } = prev;
        return rest;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountrySelect = (country) => {
    handleChange({ name: 'countryCode', value: country.code });
    setIsCountryDropdownOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(totalSteps)) {
      return;
    }
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { countryCode, ...rest } = formData;
      const formattedWhatsapp = formatWhatsappNumber(countryCode, rest.whatsapp);
      const payload = { ...rest, whatsapp: formattedWhatsapp };
      const response = await fetch(`${apiBaseUrl}/contact/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        data = {};
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'تعذر إرسال الطلب. يرجى المحاولة لاحقاً.');
      }

      setStatus({
        type: 'success',
        message: data.message || 'تم استلام طلب الاستشارة بنجاح!'
      });
      setFormData(initialFormState);
      setStep(1);
      setErrors({});
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  const setErrorMessage = (message) => {
    setStatus({ type: 'error', message });
  };

  const validateStep = (currentStep, shouldShowError = true) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!formData.name) {
        nextErrors.name = 'يرجى إدخال الاسم الكامل.';
      } else if (formData.name.trim().length < 2) {
        nextErrors.name = 'يرجى كتابة اسم كامل صحيح.';
      }

      if (!formData.email) {
        nextErrors.email = 'يرجى إدخال البريد الإلكتروني.';
      } else if (!emailPattern.test(formData.email.trim())) {
        nextErrors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
      }

      if (!formData.whatsapp) {
        nextErrors.whatsapp = 'يرجى إدخال رقم الواتساب.';
      } else if (!isValidWhatsApp(formData.whatsapp, formData.countryCode)) {
        nextErrors.whatsapp = 'يرجى إدخال رقم واتساب صحيح مع رمز الدولة.';
      }

      if (!formData.companyType) {
        nextErrors.companyType = 'يرجى اختيار نوع الشركة.';
      }
    }

    if (currentStep === 2) {
      if (formData.companyType === 'Individual') {
        if (formData.serviceType.length === 0) {
          nextErrors.serviceType = 'يرجى اختيار نوع الخدمة المطلوبة.';
        }
        if (!formData.budget) {
          nextErrors.budget = 'يرجى تحديد الميزانية.';
        }
        if (!formData.timeline) {
          nextErrors.timeline = 'يرجى تحديد موعد بدء المشروع.';
        }
        if (!formData.details) {
          nextErrors.details = 'يرجى كتابة نبذة عن احتياجك.';
        } else if (formData.details.trim().length < 20) {
          nextErrors.details = 'يرجى كتابة تفاصيل أكثر عن احتياجك.';
        }
      } else if (formData.companyType === 'Company') {
        if (!formData.companyName) {
          nextErrors.companyName = 'يرجى إدخال اسم الشركة.';
        } else if (formData.companyName.trim().length < 2) {
          nextErrors.companyName = 'يرجى إدخال اسم الشركة بشكل صحيح.';
        }

        if (!formData.role) {
          nextErrors.role = 'يرجى إدخال دورك داخل الشركة.';
        } else if (formData.role.trim().length < 2) {
          nextErrors.role = 'يرجى إدخال دور صحيح.';
        }

        if (!formData.teamSize) {
          nextErrors.teamSize = 'يرجى اختيار حجم الفريق.';
        }

        if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
          nextErrors.companyWebsite = 'يرجى إدخال رابط موقع صحيح.';
        }
      }
    }

    if (currentStep === 3 && formData.companyType === 'Company') {
      if (!formData.projectHelp) {
        nextErrors.projectHelp = 'يرجى إدخال وصف المشروع.';
      } else if (formData.projectHelp.trim().length < 3) {
        nextErrors.projectHelp = 'يرجى كتابة وصف أوضح للمشروع.';
      }

      if (!formData.budget) {
        nextErrors.budget = 'يرجى تحديد الميزانية.';
      }

      if (!formData.timeline) {
        nextErrors.timeline = 'يرجى تحديد موعد البدء.';
      }
    }

    const hasErrors = Object.keys(nextErrors).length > 0;
    if (shouldShowError) {
      setErrors(nextErrors);
      if (hasErrors) {
        setErrorMessage('يرجى تصحيح الحقول المميزة أدناه.');
      }
    }
    return !hasErrors;
  };

  const renderError = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-xs text-red-600 dark:text-red-300">
        {errors[field]}
      </p>
    ) : null;

  const handleNext = () => {
    setStatus({ type: '', message: '' });
    if (!validateStep(step)) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStatus({ type: '', message: '' });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full">
      {status.message && status.type !== 'success' && (
        <div className="mb-5 rounded-xl border px-4 py-4 text-xs sm:text-sm flex items-start gap-3 border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <span className="mt-0.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </span>
          <div className="space-y-1">
            <p className="font-semibold">{status.message}</p>
          </div>
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(
        status.type === 'success' && status.message ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-100 dark:border-dark-card-border bg-white dark:bg-dark-secondary px-5 py-4 text-center shadow-xl">
              <p className="text-sm sm:text-base font-medium text-accent-600 dark:text-dark-text-primary">
                {status.message}
              </p>
              <button
                type="button"
                onClick={() => setStatus({ type: '', message: '' })}
                className="btn-primary text-sm sm:text-base px-6 py-2.5 w-full mt-4"
              >
                تم
              </button>
            </div>
          </div>
        ) : null,
        document.body
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6"
      >
        <input type="hidden" name="source" value={formData.source} />
        <div className="flex items-center justify-between text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
          <span>الخطوة {step} من {totalSteps}</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, idx) => idx + 1).map((dot) => (
              <span
                key={dot}
                className={`h-2 w-2 rounded-full transition-colors ${step >= dot
                  ? 'bg-primary-500 dark:bg-orange-500'
                  : 'bg-gray-300 dark:bg-dark-card-border'
                  }`}
              />
            ))}
          </div>
        </div>

        <div
          key={`${step}-${formData.companyType}`}
          className="step-transition grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  الاسم الكامل
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="اكتب اسمك الكامل"
                />
                {renderError('name')}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  البريد الإلكتروني
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  maxLength={254}
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="example@email.com"
                />
                {renderError('email')}
              </div>

              <div className="form-group md:col-span-2">
                <label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  رقم الواتساب
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      required
                      inputMode="tel"
                      pattern="^[0-9][0-9\s()-]{6,}$"
                      dir="ltr"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.whatsapp)}
                      aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-left border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      placeholder="مثال: 01034256344"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                  <div className="relative w-full sm:w-28" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border rounded-lg sm:rounded-xl text-right flex items-center justify-between gap-2 transition-colors duration-200 ${isCountryDropdownOpen
                        ? 'border-primary-500 ring-2 ring-primary-500'
                        : 'border-gray-200 dark:border-dark-input-border'
                        } bg-white dark:bg-dark-secondary`}
                      aria-haspopup="listbox"
                      aria-expanded={isCountryDropdownOpen}
                    >
                      <span className="flex-1 text-right truncate">
                        {selectedCountry ? selectedCountry.code : formData.countryCode}
                      </span>
                      <ReactCountryFlag
                        countryCode={selectedCountry?.countryCode || 'EG'}
                        svg
                        style={{ width: '16px', height: '12px' }}
                        className="sm:w-5 sm:h-4"
                      />
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isCountryDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute z-50 w-full mt-2 max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg"
                      >
                        {countryOptions.map((country, index) => (
                          <button
                            key={`${country.code}-${country.name}-${index}`}
                            type="button"
                            role="option"
                            aria-selected={country.code === formData.countryCode}
                            onClick={() => handleCountrySelect(country)}
                            className={`w-full text-right px-4 py-2 text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 ${country.code === formData.countryCode
                              ? 'bg-primary-50 text-primary-600 dark:bg-orange-500/10 dark:text-orange-300'
                              : 'text-accent-600 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                              }`}
                          >
                            <span className="truncate">{country.code}</span>
                            <ReactCountryFlag
                              countryCode={country.countryCode}
                              svg
                              style={{ width: '16px', height: '12px' }}
                              className="sm:w-5 sm:h-4"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {renderError('whatsapp')}
              </div>

              <div className="form-group md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  هل أنت فرد أم فريق؟
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base cursor-pointer transition-colors ${formData.companyType === 'Individual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-orange-500/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-dark-input-border'
                    }`}>
                    <input
                      type="radio"
                      name="companyType"
                      value="Individual"
                      checked={formData.companyType === 'Individual'}
                      onChange={handleChange}
                      className="accent-primary-500"
                    />
                    <span>فرد / مستقل</span>
                  </label>
                  <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base cursor-pointer transition-colors ${formData.companyType === 'Company'
                    ? 'border-primary-500 bg-primary-50 dark:bg-orange-500/10 dark:border-orange-400'
                    : 'border-gray-200 dark:border-dark-input-border'
                    }`}>
                    <input
                      type="radio"
                      name="companyType"
                      value="Company"
                      checked={formData.companyType === 'Company'}
                      onChange={handleChange}
                      className="accent-primary-500"
                    />
                    <span>شركة / فريق</span>
                  </label>
                </div>
                {renderError('companyType')}
              </div>
            </>
          )}

          {step === 2 && formData.companyType === 'Individual' && (
            <>
              <div className="md:col-span-2">
                <MultiSelectDropdown
                  label="نوع الخدمة المطلوبة"
                  name="serviceType"
                  values={formData.serviceType}
                  onChange={handleChange}
                  placeholder="اختر الخدمة"
                  required
                  options={[
                    { value: 'مساحات عمل مخصصة', label: 'مساحات عمل مخصصة' },
                    { value: 'أتمتة وتكاملات', label: 'أتمتة وتكاملات' },
                    { value: 'تدريب وتبنّي الفريق', label: 'تدريب وتبنّي الفريق' },
                    { value: 'بوابات عملاء ومشاريع', label: 'بوابات عملاء ومشاريع' },
                    { value: 'حوكمة المعرفة', label: 'حوكمة المعرفة' },
                    { value: 'تحسين العمليات', label: 'تحسين العمليات' },
                    { value: 'خدمة أخرى', label: 'خدمة أخرى' }
                  ]}
                />
                {renderError('serviceType')}
              </div>
              <div>
                <DropdownSelect
                  label="الميزانية التقديرية"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="اختر الميزانية"
                  required
                  options={[
                    { value: 'أقل من 500', label: 'أقل من 500' },
                    { value: '500 - 1000', label: '500 - 1000' },
                    { value: '1000 - 3000', label: '1000 - 3000' },
                    { value: '3000 - 10000', label: '3000 - 10000' },
                    { value: 'أكثر من 10000', label: 'أكثر من 10000' }
                  ]}
                />
                {renderError('budget')}
              </div>
              <div>
                <DropdownSelect
                  label="متى تريد بدء المشروع؟"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  placeholder="اختر الوقت"
                  required
                  options={[
                    { value: 'فوراً', label: 'فوراً' },
                    { value: '3-2 أسابيع', label: '3-2 أسابيع' },
                    { value: '2-1 شهر', label: '2-1 شهر' },
                    { value: '4-2 أشهر', label: '4-2 أشهر' },
                    { value: '8-4 أشهر', label: '8-4 أشهر' },
                    { value: 'مرن', label: 'مرن' }
                  ]}
                />
                {renderError('timeline')}
              </div>
              <div className="form-group md:col-span-2">
                <label htmlFor="details" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  نبذة مختصرة عن احتياجك
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={4}
                  required
                  minLength={20}
                  maxLength={1000}
                  value={formData.details}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.details)}
                  aria-describedby={errors.details ? 'details-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  placeholder="اشرح باختصار المطلوب أو الهدف من الاستشارة"
                />
                {renderError('details')}
              </div>
            </>
          )}

          {step === 2 && formData.companyType === 'Company' && (
            <>
              <div className="form-group">
                <label htmlFor="companyName" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  اسم الشركة
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  minLength={2}
                  maxLength={120}
                  value={formData.companyName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.companyName)}
                  aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="مثال: عرب نوشن"
                />
                {renderError('companyName')}
              </div>
              <div className="form-group">
                <label htmlFor="role" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  دورك داخل الشركة
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  required
                  minLength={2}
                  maxLength={120}
                  value={formData.role}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="مثال: مدير عمليات، مؤسس"
                />
                {renderError('role')}
              </div>
              <div>
                <DropdownSelect
                  label="عدد العاملين في الشركة"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  placeholder="اختر الحجم"
                  required
                  options={[
                    { value: '1-3', label: '1 - 3' },
                    { value: '4-10', label: '4 - 10' },
                    { value: '11-25', label: '11 - 25' },
                    { value: '26-50', label: '26 - 50' },
                    { value: '51-100', label: '51 - 100' },
                    { value: '100+', label: 'أكثر من 100' }
                  ]}
                />
                {renderError('teamSize')}
              </div>
              <div className="form-group md:col-span-2">
                <label htmlFor="companyWebsite" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  موقع الشركة الإلكتروني
                </label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="companyWebsite"
                  inputMode="url"
                  pattern="https?://.+|^[^\\s]+\\.[^\\s]+$"
                  maxLength={200}
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.companyWebsite)}
                  aria-describedby={errors.companyWebsite ? 'companyWebsite-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="https://example.com"
                />
                {renderError('companyWebsite')}
              </div>
            </>
          )}

          {step === 3 && formData.companyType === 'Company' && (
            <>
              <div className="form-group md:col-span-2">
                <label htmlFor="projectHelp" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  ما المشروع الذي تحتاج مساعدة فيه؟
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="projectHelp"
                  name="projectHelp"
                  required
                  minLength={3}
                  maxLength={140}
                  value={formData.projectHelp}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.projectHelp)}
                  aria-describedby={errors.projectHelp ? 'projectHelp-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="مثال: بناء نظام مبيعات، تنظيم المشاريع"
                />
                {renderError('projectHelp')}
              </div>
              <div>
                <DropdownSelect
                  label="الميزانية التقديرية"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="اختر الميزانية"
                  required
                  options={[
                    { value: 'أقل من 500', label: 'أقل من 500' },
                    { value: '500 - 1000', label: '500 - 1000' },
                    { value: '1000 - 3000', label: '1000 - 3000' },
                    { value: '3000 - 10000', label: '3000 - 10000' },
                    { value: 'أكثر من 10000', label: 'أكثر من 10000' }
                  ]}
                />
                {renderError('budget')}
              </div>
              <div>
                <DropdownSelect
                  label="متى تريد بدء المشروع؟"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  placeholder="اختر الوقت"
                  required
                  options={[
                    { value: 'فوراً', label: 'فوراً' },
                    { value: '3-2 أسابيع', label: '3-2 أسابيع' },
                    { value: '2-1 شهر', label: '2-1 شهر' },
                    { value: '4-2 أشهر', label: '4-2 أشهر' },
                    { value: '8-4 أشهر', label: '8-4 أشهر' },
                    { value: 'مرن', label: 'مرن' }
                  ]}
                />
                {renderError('timeline')}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full flex-col sm:flex-row gap-3 sm:items-center">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto"
              >
                رجوع
              </button>
            )}
            {step < totalSteps ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="btn-primary text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto"
              >
                التالي
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                className="btn-primary text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'جارٍ الإرسال...' : 'احجز الآن'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
