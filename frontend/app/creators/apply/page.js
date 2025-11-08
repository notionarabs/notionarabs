'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { countries } from 'country-list';
import ReactCountryFlag from 'react-country-flag';

const createInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  countryCode: '+20', // Default to Egypt
  portfolio: '',
  experience: '',
  specialties: [],
  motivation: '',
  agreeToTerms: false
});

export default function CreatorApplyPage() {
  const [formData, setFormData] = useState(createInitialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const countryDropdownRef = useRef(null);
  const specialtyDropdownRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const { user, isAuthenticated, checkAuthStatus, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (draftLoadedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedDraft = localStorage.getItem('creatorApplyDraft');
      if (storedDraft) {
        const parsedDraft = JSON.parse(storedDraft);

        if (parsedDraft?.formData) {
          setFormData(prev => ({
            ...prev,
            ...parsedDraft.formData,
            specialties: Array.isArray(parsedDraft.formData.specialties)
              ? parsedDraft.formData.specialties
              : prev.specialties
          }));
        }

        if (typeof parsedDraft?.customSpecialty === 'string') {
          setCustomSpecialty(parsedDraft.customSpecialty);
        }

        if (typeof parsedDraft?.showCustomInput === 'boolean') {
          setShowCustomInput(parsedDraft.showCustomInput);
        }
      }
    } catch (error) {
      console.error('Failed to load creator application draft:', error);
    } finally {
      draftLoadedRef.current = true;
    }
  }, []);

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Monitor user creatorStatus changes to update UI
  useEffect(() => {
    if (user?.creatorStatus === 'pending' && success) {
      // If user status is pending and we just submitted successfully, 
      // the pending state will be shown by the conditional render below
      setSuccess(false); // Reset success state since we're showing pending
    }
  }, [user?.creatorStatus, success]);

  // Auto-refresh user data when on pending page to check for status updates
  useEffect(() => {
    if (user?.creatorStatus === 'pending') {
      const interval = setInterval(async () => {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('Failed to refresh user status:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.creatorStatus, checkAuthStatus]);

  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close country dropdown
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }

      // Close specialty dropdown
      if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(event.target)) {
        setIsSpecialtyDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
        setIsSpecialtyDropdownOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user?.creatorStatus === 'pending' || user?.creatorStatus === 'approved') {
      try {
        localStorage.removeItem('creatorApplyDraft');
      } catch (error) {
        console.error('Failed to clear creator application draft:', error);
      }
    }
  }, [user?.creatorStatus]);

  useEffect(() => {
    if (!draftLoadedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const draftPayload = {
        formData,
        customSpecialty,
        showCustomInput
      };

      localStorage.setItem('creatorApplyDraft', JSON.stringify(draftPayload));
    } catch (error) {
      console.error('Failed to save creator application draft:', error);
    }
  }, [formData, customSpecialty, showCustomInput]);

  const specialtyOptions = [
    'الإنتاجية والتنظيم',
    'العمل والأعمال',
    'الدراسة والبحث',
    'التخطيط الشخصي',
    'إدارة المشاريع',
    'التسويق والمبيعات',
    'التصميم الجرافيكي',
    'التطوير والبرمجة',
    'الكتابة والمحتوى',
    'التمويل والمحاسبة',
    'الموارد البشرية',
    'التعليم والتدريب',
    'أخرى'
  ];

  // Complete list of all countries with phone codes and country codes, sorted alphabetically
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'specialties') {
      if (value === 'أخرى') {
        setShowCustomInput(checked);
        if (!checked) {
          // Remove custom specialty from specialties array when unchecking "أخرى"
          setCustomSpecialty('');
          setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(item =>
              item !== 'أخرى' && item !== customSpecialty.trim()
            )
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          specialties: checked
            ? [...prev.specialties, value]
            : prev.specialties.filter(item => item !== value)
        }));
      }
    } else if (name === 'customSpecialty') {
      setCustomSpecialty(value);
      // Only update specialties when the user finishes typing (on blur or when they stop typing)
      // This prevents adding partial words as specialties
    } else {
      // Handle phone number input with restrictions
      if (name === 'phone') {
        // Only allow numbers, spaces, hyphens, parentheses, and plus signs
        const phoneRegex = /^[0-9\s\-\(\)\+]*$/;
        if (phoneRegex.test(value) || value === '') {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));

          // Real-time phone validation
          if (value.trim()) {
            if (validatePhoneNumber(value, formData.countryCode)) {
              setPhoneError('');
            } else {
              setPhoneError('رقم الهاتف غير صحيح');
            }
          } else {
            setPhoneError('');
          }
        }
        // If invalid characters, don't update the state
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    }
    setError('');
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code
    }));
    setIsCountryDropdownOpen(false);

    // Re-validate phone number when country changes
    if (formData.phone.trim()) {
      if (validatePhoneNumber(formData.phone, country.code)) {
        setPhoneError('');
      } else {
        setPhoneError('رقم الهاتف غير صحيح');
      }
    }
  };

  const handleCustomSpecialtyBlur = () => {
    if (customSpecialty.trim()) {
      const trimmedSpecialty = customSpecialty.trim();

      // Split by comma and clean up each specialty
      const specialties = trimmedSpecialty
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      setFormData(prev => {
        // Remove any existing custom specialties and 'أخرى' from the array
        const filteredSpecialties = prev.specialties.filter(item =>
          item !== 'أخرى' && !specialties.includes(item)
        );

        // Add the new custom specialties
        return {
          ...prev,
          specialties: [...filteredSpecialties, ...specialties]
        };
      });
    }
  };

  const handleCustomSpecialtyKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSpecialtyBlur();
    }
  };

  const handleSpecialtySelect = (specialty) => {
    if (specialty === 'أخرى') {
      setShowCustomInput(true);
      setIsSpecialtyDropdownOpen(false);
    } else {
      setFormData(prev => ({
        ...prev,
        specialties: prev.specialties.includes(specialty)
          ? prev.specialties.filter(item => item !== specialty)
          : [...prev.specialties, specialty]
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number, space, hyphen, parenthesis, or plus sign and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 32 && // space
      e.keyCode !== 189 && // hyphen
      e.keyCode !== 187 && // plus
      e.keyCode !== 219 && // left parenthesis
      e.keyCode !== 221) { // right parenthesis
      e.preventDefault();
    }
  };

  const validatePhoneNumber = (phone, countryCode) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Comprehensive phone number patterns for all countries
    const phonePatterns = {
      // Middle East & North Africa
      '+20': /^1[0-9]{9}$/, // Egypt: 10 digits starting with 1
      '+966': /^5\d{8}$/, // Saudi Arabia: 9 digits starting with 5
      '+971': /^5[0-9]{8}$/, // UAE: 9 digits starting with 5
      '+974': /^[3-7]\d{7}$/, // Qatar: 8 digits starting with 3-7
      '+965': /^[569]\d{7}$/, // Kuwait: 8 digits starting with 5,6,9
      '+973': /^[3-9]\d{7}$/, // Bahrain: 8 digits starting with 3-9
      '+968': /^[79]\d{7}$/, // Oman: 8 digits starting with 7 or 9
      '+962': /^7[7-9]\d{7}$/, // Jordan: 9 digits starting with 77-79
      '+961': /^[3-9]\d{7}$/, // Lebanon: 8 digits starting with 3-9
      '+963': /^9\d{8}$/, // Syria: 9 digits starting with 9
      '+964': /^7[3-9]\d{8}$/, // Iraq: 10 digits starting with 73-79
      '+98': /^9[0-9]\d{8}$/, // Iran: 10 digits starting with 9
      '+90': /^5\d{9}$/, // Turkey: 10 digits starting with 5
      '+212': /^[6-7]\d{8}$/, // Morocco: 9 digits starting with 6 or 7
      '+213': /^[5-7]\d{8}$/, // Algeria: 9 digits starting with 5-7
      '+216': /^[2-5]\d{7}$/, // Tunisia: 8 digits starting with 2-5
      '+218': /^9[1-9]\d{7}$/, // Libya: 9 digits starting with 91-99
      '+249': /^9[0-9]\d{7}$/, // Sudan: 9 digits starting with 9
      '+967': /^7[0-9]\d{7}$/, // Yemen: 9 digits starting with 7
      '+970': /^5[0-9]{8}$/, // Palestine: 9 digits starting with 5
      '+383': /^[4-6]\d{7}$/, // Kosovo: 8 digits starting with 4-6

      // North America
      '+1': /^[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US/Canada: 10 digits

      // Europe
      '+44': /^[1-9]\d{8,9}$/, // UK: 9-10 digits
      '+33': /^[1-9]\d{8}$/, // France: 9 digits
      '+49': /^[1-9]\d{10,11}$/, // Germany: 10-11 digits
      '+39': /^3\d{9}$/, // Italy: 10 digits starting with 3
      '+34': /^[6-9]\d{8}$/, // Spain: 9 digits starting with 6-9
      '+31': /^6\d{8}$/, // Netherlands: 9 digits starting with 6
      '+32': /^4\d{8}$/, // Belgium: 9 digits starting with 4
      '+41': /^7[5-9]\d{8}$/, // Switzerland: 10 digits starting with 75-79
      '+43': /^6[0-9]\d{7}$/, // Austria: 9 digits starting with 6
      '+45': /^[2-9]\d{7}$/, // Denmark: 8 digits starting with 2-9
      '+46': /^7[0-9]\d{7}$/, // Sweden: 9 digits starting with 7
      '+47': /^[4-9]\d{7}$/, // Norway: 8 digits starting with 4-9
      '+48': /^[5-9]\d{8}$/, // Poland: 9 digits starting with 5-9
      '+351': /^9[1-9]\d{7}$/, // Portugal: 9 digits starting with 91-99
      '+420': /^[6-9]\d{8}$/, // Czech Republic: 9 digits starting with 6-9
      '+421': /^9[0-9]\d{7}$/, // Slovakia: 9 digits starting with 9
      '+386': /^[3-9]\d{7}$/, // Slovenia: 8 digits starting with 3-9
      '+385': /^9[0-9]\d{7}$/, // Croatia: 9 digits starting with 9
      '+382': /^6[0-9]\d{6}$/, // Montenegro: 8 digits starting with 6
      '+381': /^6[0-9]\d{7}$/, // Serbia: 9 digits starting with 6
      '+359': /^8[7-9]\d{7}$/, // Bulgaria: 9 digits starting with 87-89
      '+40': /^7[0-9]\d{7}$/, // Romania: 9 digits starting with 7
      '+30': /^6[0-9]\d{8}$/, // Greece: 10 digits starting with 6
      '+36': /^[2-9]\d{8}$/, // Hungary: 9 digits starting with 2-9
      '+370': /^6\d{7}$/, // Lithuania: 8 digits starting with 6
      '+371': /^2\d{7}$/, // Latvia: 8 digits starting with 2
      '+372': /^[5-9]\d{7}$/, // Estonia: 8 digits starting with 5-9
      '+358': /^[4-5]\d{8}$/, // Finland: 9 digits starting with 4-5
      '+354': /^[6-9]\d{7}$/, // Iceland: 8 digits starting with 6-9
      '+353': /^[8-9]\d{8}$/, // Ireland: 9 digits starting with 8-9
      '+352': /^6[0-9]\d{6}$/, // Luxembourg: 8 digits starting with 6
      '+423': /^7[5-9]\d{6}$/, // Liechtenstein: 8 digits starting with 75-79
      '+377': /^[4-6]\d{7}$/, // Monaco: 8 digits starting with 4-6
      '+378': /^6[0-9]\d{6}$/, // San Marino: 8 digits starting with 6
      '+376': /^[3-6]\d{6}$/, // Andorra: 7 digits starting with 3-6
      '+355': /^6[0-9]\d{7}$/, // Albania: 9 digits starting with 6
      '+389': /^7[0-9]\d{6}$/, // North Macedonia: 8 digits starting with 7
      '+387': /^6[0-9]\d{6}$/, // Bosnia and Herzegovina: 8 digits starting with 6
      '+373': /^[6-7]\d{7}$/, // Moldova: 8 digits starting with 6-7
      '+380': /^[3-9]\d{8}$/, // Ukraine: 9 digits starting with 3-9
      '+375': /^[2-9]\d{8}$/, // Belarus: 9 digits starting with 2-9
      '+7': /^[3-9]\d{9}$/, // Russia/Kazakhstan: 10 digits starting with 3-9

      // Asia
      '+86': /^1[3-9]\d{9}$/, // China: 11 digits starting with 1
      '+81': /^[7-9]\d{9}$/, // Japan: 10 digits starting with 7-9
      '+82': /^1[0-9]\d{7,8}$/, // South Korea: 9-10 digits starting with 1
      '+91': /^[6-9]\d{9}$/, // India: 10 digits starting with 6-9
      '+92': /^3[0-9]\d{8}$/, // Pakistan: 10 digits starting with 3
      '+880': /^1[3-9]\d{8}$/, // Bangladesh: 10 digits starting with 1
      '+94': /^7[0-9]\d{7}$/, // Sri Lanka: 9 digits starting with 7
      '+977': /^9[6-8]\d{8}$/, // Nepal: 10 digits starting with 96-98
      '+975': /^[1-7]\d{7}$/, // Bhutan: 8 digits starting with 1-7
      '+880': /^1[3-9]\d{8}$/, // Bangladesh: 10 digits starting with 1
      '+93': /^7[0-9]\d{7}$/, // Afghanistan: 9 digits starting with 7
      '+996': /^[5-7]\d{8}$/, // Kyrgyzstan: 9 digits starting with 5-7
      '+998': /^[6-9]\d{8}$/, // Uzbekistan: 9 digits starting with 6-9
      '+992': /^9[0-9]\d{7}$/, // Tajikistan: 9 digits starting with 9
      '+993': /^6[0-9]\d{6}$/, // Turkmenistan: 8 digits starting with 6
      '+850': /^1[9]\d{7}$/, // North Korea: 9 digits starting with 19
      '+886': /^9\d{8}$/, // Taiwan: 9 digits starting with 9
      '+852': /^[5-9]\d{7}$/, // Hong Kong: 8 digits starting with 5-9
      '+853': /^6\d{7}$/, // Macau: 8 digits starting with 6
      '+65': /^[8-9]\d{7}$/, // Singapore: 8 digits starting with 8-9
      '+60': /^1[0-9]\d{7,8}$/, // Malaysia: 9-10 digits starting with 1
      '+66': /^[6-9]\d{8}$/, // Thailand: 9 digits starting with 6-9
      '+84': /^[3-9]\d{8}$/, // Vietnam: 9 digits starting with 3-9
      '+855': /^[1-9]\d{7,8}$/, // Cambodia: 8-9 digits starting with 1-9
      '+856': /^[2-9]\d{7}$/, // Laos: 8 digits starting with 2-9
      '+95': /^9[0-9]\d{7}$/, // Myanmar: 9 digits starting with 9
      '+63': /^9[0-9]\d{8}$/, // Philippines: 10 digits starting with 9
      '+62': /^8[1-9]\d{7,8}$/, // Indonesia: 9-10 digits starting with 8
      '+673': /^[7-8]\d{6}$/, // Brunei: 7 digits starting with 7-8
      '+670': /^7[0-9]\d{6}$/, // East Timor: 8 digits starting with 7

      // Africa
      '+27': /^[6-8]\d{8}$/, // South Africa: 9 digits starting with 6-8
      '+234': /^[7-9]\d{9}$/, // Nigeria: 10 digits starting with 7-9
      '+254': /^[7]\d{8}$/, // Kenya: 9 digits starting with 7
      '+256': /^[7]\d{8}$/, // Uganda: 9 digits starting with 7
      '+255': /^[6-7]\d{8}$/, // Tanzania: 9 digits starting with 6-7
      '+250': /^[7]\d{8}$/, // Rwanda: 9 digits starting with 7
      '+251': /^9[0-9]\d{7}$/, // Ethiopia: 9 digits starting with 9
      '+233': /^[2-5]\d{8}$/, // Ghana: 9 digits starting with 2-5
      '+220': /^[2-7]\d{7}$/, // Gambia: 8 digits starting with 2-7
      '+221': /^[7]\d{8}$/, // Senegal: 9 digits starting with 7
      '+223': /^[6-7]\d{7}$/, // Mali: 8 digits starting with 6-7
      '+224': /^[6]\d{8}$/, // Guinea: 9 digits starting with 6
      '+225': /^[0-7]\d{8}$/, // Ivory Coast: 9 digits starting with 0-7
      '+226': /^[6-7]\d{7}$/, // Burkina Faso: 8 digits starting with 6-7
      '+227': /^[9]\d{7}$/, // Niger: 8 digits starting with 9
      '+228': /^[9]\d{7}$/, // Togo: 8 digits starting with 9
      '+229': /^[6-7]\d{7}$/, // Benin: 8 digits starting with 6-7
      '+230': /^[5-7]\d{7}$/, // Mauritius: 8 digits starting with 5-7
      '+231': /^[4-7]\d{7}$/, // Liberia: 8 digits starting with 4-7
      '+232': /^[2-3]\d{7}$/, // Sierra Leone: 8 digits starting with 2-3
      '+233': /^[2-5]\d{8}$/, // Ghana: 9 digits starting with 2-5
      '+234': /^[7-9]\d{9}$/, // Nigeria: 10 digits starting with 7-9
      '+235': /^[6-7]\d{7}$/, // Chad: 8 digits starting with 6-7
      '+236': /^[7]\d{7}$/, // Central African Republic: 8 digits starting with 7
      '+237': /^[6-7]\d{8}$/, // Cameroon: 9 digits starting with 6-7
      '+238': /^[9]\d{6}$/, // Cape Verde: 7 digits starting with 9
      '+239': /^[9]\d{6}$/, // Sao Tome and Principe: 7 digits starting with 9
      '+240': /^[2]\d{8}$/, // Equatorial Guinea: 9 digits starting with 2
      '+241': /^[0-1]\d{7}$/, // Gabon: 8 digits starting with 0-1
      '+242': /^[0]\d{8}$/, // Republic of the Congo: 9 digits starting with 0
      '+243': /^[8-9]\d{8}$/, // Democratic Republic of the Congo: 9 digits starting with 8-9
      '+244': /^[9]\d{8}$/, // Angola: 9 digits starting with 9
      '+245': /^[9]\d{7}$/, // Guinea-Bissau: 8 digits starting with 9
      '+246': /^[3]\d{6}$/, // British Indian Ocean Territory: 7 digits starting with 3
      '+248': /^[2]\d{6}$/, // Seychelles: 7 digits starting with 2
      '+249': /^9[0-9]\d{7}$/, // Sudan: 9 digits starting with 9
      '+250': /^[7]\d{8}$/, // Rwanda: 9 digits starting with 7
      '+251': /^9[0-9]\d{7}$/, // Ethiopia: 9 digits starting with 9
      '+252': /^[6-7]\d{7}$/, // Somalia: 8 digits starting with 6-7
      '+253': /^[7]\d{7}$/, // Djibouti: 8 digits starting with 7
      '+254': /^[7]\d{8}$/, // Kenya: 9 digits starting with 7
      '+255': /^[6-7]\d{8}$/, // Tanzania: 9 digits starting with 6-7
      '+256': /^[7]\d{8}$/, // Uganda: 9 digits starting with 7
      '+257': /^[7]\d{7}$/, // Burundi: 8 digits starting with 7
      '+258': /^[8]\d{8}$/, // Mozambique: 9 digits starting with 8
      '+260': /^[9]\d{8}$/, // Zambia: 9 digits starting with 9
      '+261': /^[3]\d{8}$/, // Madagascar: 9 digits starting with 3
      '+262': /^[6]\d{8}$/, // Reunion: 9 digits starting with 6
      '+263': /^[7]\d{8}$/, // Zimbabwe: 9 digits starting with 7
      '+264': /^[8]\d{7}$/, // Namibia: 8 digits starting with 8
      '+265': /^[9]\d{7}$/, // Malawi: 8 digits starting with 9
      '+266': /^[5-6]\d{7}$/, // Lesotho: 8 digits starting with 5-6
      '+267': /^[7]\d{7}$/, // Botswana: 8 digits starting with 7
      '+268': /^[7]\d{7}$/, // Swaziland: 8 digits starting with 7
      '+269': /^[3]\d{6}$/, // Comoros: 7 digits starting with 3
      '+290': /^[8]\d{3}$/, // Saint Helena: 4 digits starting with 8
      '+291': /^[1]\d{7}$/, // Eritrea: 8 digits starting with 1
      '+297': /^[5]\d{6}$/, // Aruba: 7 digits starting with 5
      '+298': /^[2]\d{6}$/, // Faroe Islands: 7 digits starting with 2
      '+299': /^[2]\d{6}$/, // Greenland: 7 digits starting with 2

      // Oceania
      '+61': /^[4-5]\d{8}$/, // Australia: 9 digits starting with 4-5
      '+64': /^[2]\d{7,8}$/, // New Zealand: 8-9 digits starting with 2
      '+679': /^[7-9]\d{6}$/, // Fiji: 7 digits starting with 7-9
      '+685': /^[6-7]\d{6}$/, // Samoa: 7 digits starting with 6-7
      '+676': /^[7]\d{6}$/, // Tonga: 7 digits starting with 7
      '+677': /^[7]\d{6}$/, // Solomon Islands: 7 digits starting with 7
      '+678': /^[5-7]\d{6}$/, // Vanuatu: 7 digits starting with 5-7
      '+680': /^[6]\d{6}$/, // Palau: 7 digits starting with 6
      '+681': /^[4]\d{5}$/, // Wallis and Futuna: 6 digits starting with 4
      '+682': /^[2-5]\d{5}$/, // Cook Islands: 6 digits starting with 2-5
      '+683': /^[5]\d{5}$/, // Niue: 6 digits starting with 5
      '+684': /^[6]\d{5}$/, // American Samoa: 6 digits starting with 6
      '+685': /^[6-7]\d{6}$/, // Samoa: 7 digits starting with 6-7
      '+686': /^[2-9]\d{6}$/, // Kiribati: 7 digits starting with 2-9
      '+687': /^[7]\d{6}$/, // New Caledonia: 7 digits starting with 7
      '+688': /^[2]\d{6}$/, // Tuvalu: 7 digits starting with 2
      '+689': /^[8]\d{7}$/, // French Polynesia: 8 digits starting with 8
      '+690': /^[3]\d{5}$/, // Tokelau: 6 digits starting with 3
      '+691': /^[3]\d{6}$/, // Micronesia: 7 digits starting with 3
      '+692': /^[2-3]\d{6}$/, // Marshall Islands: 7 digits starting with 2-3

      // South America
      '+55': /^[1-9]\d{10}$/, // Brazil: 11 digits starting with 1-9
      '+54': /^[1-9]\d{9}$/, // Argentina: 10 digits starting with 1-9
      '+56': /^[2-9]\d{8}$/, // Chile: 9 digits starting with 2-9
      '+57': /^[3]\d{9}$/, // Colombia: 10 digits starting with 3
      '+58': /^[2-4]\d{9}$/, // Venezuela: 10 digits starting with 2-4
      '+51': /^[9]\d{8}$/, // Peru: 9 digits starting with 9
      '+52': /^[1-9]\d{9}$/, // Mexico: 10 digits starting with 1-9
      '+53': /^[5]\d{7}$/, // Cuba: 8 digits starting with 5
      '+592': /^[6]\d{6}$/, // Guyana: 7 digits starting with 6
      '+593': /^[9]\d{8}$/, // Ecuador: 9 digits starting with 9
      '+594': /^[6]\d{8}$/, // French Guiana: 9 digits starting with 6
      '+595': /^[9]\d{8}$/, // Paraguay: 9 digits starting with 9
      '+596': /^[6]\d{8}$/, // Martinique: 9 digits starting with 6
      '+597': /^[6-7]\d{6}$/, // Suriname: 7 digits starting with 6-7
      '+598': /^[9]\d{7}$/, // Uruguay: 8 digits starting with 9
      '+599': /^[9]\d{6}$/, // Netherlands Antilles: 7 digits starting with 9

      // Central America & Caribbean
      '+500': /^[2-9]\d{4}$/, // Falkland Islands: 5 digits starting with 2-9
      '+501': /^[6]\d{6}$/, // Belize: 7 digits starting with 6
      '+502': /^[4-6]\d{7}$/, // Guatemala: 8 digits starting with 4-6
      '+503': /^[6-7]\d{7}$/, // El Salvador: 8 digits starting with 6-7
      '+504': /^[8-9]\d{7}$/, // Honduras: 8 digits starting with 8-9
      '+505': /^[8]\d{7}$/, // Nicaragua: 8 digits starting with 8
      '+506': /^[6-8]\d{7}$/, // Costa Rica: 8 digits starting with 6-8
      '+507': /^[6]\d{7}$/, // Panama: 8 digits starting with 6
      '+508': /^[5]\d{5}$/, // Saint Pierre and Miquelon: 6 digits starting with 5
      '+509': /^[3-4]\d{7}$/, // Haiti: 8 digits starting with 3-4
      '+590': /^[6]\d{8}$/, // Guadeloupe: 9 digits starting with 6
      '+591': /^[6-7]\d{7}$/, // Bolivia: 8 digits starting with 6-7
      '+592': /^[6]\d{6}$/, // Guyana: 7 digits starting with 6
      '+593': /^[9]\d{8}$/, // Ecuador: 9 digits starting with 9
      '+594': /^[6]\d{8}$/, // French Guiana: 9 digits starting with 6
      '+595': /^[9]\d{8}$/, // Paraguay: 9 digits starting with 9
      '+596': /^[6]\d{8}$/, // Martinique: 9 digits starting with 6
      '+597': /^[6-7]\d{6}$/, // Suriname: 7 digits starting with 6-7
      '+598': /^[9]\d{7}$/, // Uruguay: 8 digits starting with 9
      '+599': /^[9]\d{6}$/, // Netherlands Antilles: 7 digits starting with 9

      // Special cases and territories
      '+672': /^[1-4]\d{5}$/, // Antarctica/Norfolk Island: 6 digits starting with 1-4
      '+290': /^[8]\d{3}$/, // Saint Helena: 4 digits starting with 8
      '+291': /^[1]\d{7}$/, // Eritrea: 8 digits starting with 1
      '+297': /^[5]\d{6}$/, // Aruba: 7 digits starting with 5
      '+298': /^[2]\d{6}$/, // Faroe Islands: 7 digits starting with 2
      '+299': /^[2]\d{6}$/, // Greenland: 7 digits starting with 2
      '+350': /^[5]\d{7}$/, // Gibraltar: 8 digits starting with 5
      '+351': /^[9]\d{8}$/, // Portugal: 9 digits starting with 9
      '+352': /^[6]\d{7}$/, // Luxembourg: 8 digits starting with 6
      '+353': /^[8]\d{8}$/, // Ireland: 9 digits starting with 8
      '+354': /^[6]\d{7}$/, // Iceland: 8 digits starting with 6
      '+355': /^[6]\d{7}$/, // Albania: 8 digits starting with 6
      '+356': /^[7-9]\d{7}$/, // Malta: 8 digits starting with 7-9
      '+357': /^[9]\d{7}$/, // Cyprus: 8 digits starting with 9
      '+358': /^[4]\d{8}$/, // Finland: 9 digits starting with 4
      '+359': /^[8]\d{7}$/, // Bulgaria: 8 digits starting with 8
      '+370': /^[6]\d{7}$/, // Lithuania: 8 digits starting with 6
      '+371': /^[2]\d{7}$/, // Latvia: 8 digits starting with 2
      '+372': /^[5]\d{7}$/, // Estonia: 8 digits starting with 5
      '+373': /^[6]\d{7}$/, // Moldova: 8 digits starting with 6
      '+374': /^[4]\d{7}$/, // Armenia: 8 digits starting with 4
      '+375': /^[2]\d{8}$/, // Belarus: 9 digits starting with 2
      '+376': /^[3]\d{6}$/, // Andorra: 7 digits starting with 3
      '+377': /^[4]\d{7}$/, // Monaco: 8 digits starting with 4
      '+378': /^[6]\d{6}$/, // San Marino: 7 digits starting with 6
      '+379': /^[6]\d{6}$/, // Vatican: 7 digits starting with 6
      '+380': /^[3]\d{8}$/, // Ukraine: 9 digits starting with 3
      '+381': /^[6]\d{7}$/, // Serbia: 8 digits starting with 6
      '+382': /^[6]\d{6}$/, // Montenegro: 7 digits starting with 6
      '+383': /^[4]\d{7}$/, // Kosovo: 8 digits starting with 4
      '+385': /^[9]\d{7}$/, // Croatia: 8 digits starting with 9
      '+386': /^[3]\d{7}$/, // Slovenia: 8 digits starting with 3
      '+387': /^[6]\d{6}$/, // Bosnia and Herzegovina: 7 digits starting with 6
      '+389': /^[7]\d{6}$/, // North Macedonia: 7 digits starting with 7
      '+420': /^[6]\d{8}$/, // Czech Republic: 9 digits starting with 6
      '+421': /^[9]\d{7}$/, // Slovakia: 8 digits starting with 9
      '+423': /^[7]\d{6}$/, // Liechtenstein: 7 digits starting with 7
      '+500': /^[2]\d{4}$/, // Falkland Islands: 5 digits starting with 2
      '+501': /^[6]\d{6}$/, // Belize: 7 digits starting with 6
      '+502': /^[4]\d{7}$/, // Guatemala: 8 digits starting with 4
      '+503': /^[6]\d{7}$/, // El Salvador: 8 digits starting with 6
      '+504': /^[8]\d{7}$/, // Honduras: 8 digits starting with 8
      '+505': /^[8]\d{7}$/, // Nicaragua: 8 digits starting with 8
      '+506': /^[6]\d{7}$/, // Costa Rica: 8 digits starting with 6
      '+507': /^[6]\d{7}$/, // Panama: 8 digits starting with 6
      '+508': /^[5]\d{5}$/, // Saint Pierre and Miquelon: 6 digits starting with 5
      '+509': /^[3]\d{7}$/, // Haiti: 8 digits starting with 3
      '+590': /^[6]\d{8}$/, // Guadeloupe: 9 digits starting with 6
      '+591': /^[6]\d{7}$/, // Bolivia: 8 digits starting with 6
      '+592': /^[6]\d{6}$/, // Guyana: 7 digits starting with 6
      '+593': /^[9]\d{8}$/, // Ecuador: 9 digits starting with 9
      '+594': /^[6]\d{8}$/, // French Guiana: 9 digits starting with 6
      '+595': /^[9]\d{8}$/, // Paraguay: 9 digits starting with 9
      '+596': /^[6]\d{8}$/, // Martinique: 9 digits starting with 6
      '+597': /^[6]\d{6}$/, // Suriname: 7 digits starting with 6
      '+598': /^[9]\d{7}$/, // Uruguay: 8 digits starting with 9
      '+599': /^[9]\d{6}$/, // Netherlands Antilles: 7 digits starting with 9
      '+670': /^[7]\d{6}$/, // East Timor: 7 digits starting with 7
      '+672': /^[1]\d{5}$/, // Antarctica: 6 digits starting with 1
      '+673': /^[7]\d{6}$/, // Brunei: 7 digits starting with 7
      '+674': /^[5]\d{6}$/, // Nauru: 7 digits starting with 5
      '+675': /^[7]\d{7}$/, // Papua New Guinea: 8 digits starting with 7
      '+676': /^[7]\d{6}$/, // Tonga: 7 digits starting with 7
      '+677': /^[7]\d{6}$/, // Solomon Islands: 7 digits starting with 7
      '+678': /^[5]\d{6}$/, // Vanuatu: 7 digits starting with 5
      '+679': /^[7]\d{6}$/, // Fiji: 7 digits starting with 7
      '+680': /^[6]\d{6}$/, // Palau: 7 digits starting with 6
      '+681': /^[4]\d{5}$/, // Wallis and Futuna: 6 digits starting with 4
      '+682': /^[2]\d{5}$/, // Cook Islands: 6 digits starting with 2
      '+683': /^[5]\d{5}$/, // Niue: 6 digits starting with 5
      '+684': /^[6]\d{5}$/, // American Samoa: 6 digits starting with 6
      '+685': /^[6]\d{6}$/, // Samoa: 7 digits starting with 6
      '+686': /^[2]\d{6}$/, // Kiribati: 7 digits starting with 2
      '+687': /^[7]\d{6}$/, // New Caledonia: 7 digits starting with 7
      '+688': /^[2]\d{6}$/, // Tuvalu: 7 digits starting with 2
      '+689': /^[8]\d{7}$/, // French Polynesia: 8 digits starting with 8
      '+690': /^[3]\d{5}$/, // Tokelau: 6 digits starting with 3
      '+691': /^[3]\d{6}$/, // Micronesia: 7 digits starting with 3
      '+692': /^[2]\d{6}$/, // Marshall Islands: 7 digits starting with 2
    };

    const pattern = phonePatterns[countryCode];
    if (!pattern) {
      // For countries without specific patterns, check if it's a reasonable length (7-15 digits)
      return cleanPhone.length >= 7 && cleanPhone.length <= 15;
    }

    return pattern.test(cleanPhone);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      return false;
    }
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return false;
    }

    // Validate phone number format
    if (!validatePhoneNumber(formData.phone, formData.countryCode)) {
      setError('رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صحيح');
      return false;
    }
    // Portfolio field is now optional
    // if (!formData.portfolio.trim()) {
    // }
    if (!formData.experience.trim()) {
      setError('وصف الخبرة مطلوب');
      return false;
    }
    if (formData.specialties.length === 0) {
      setError('يجب اختيار مجال واحد على الأقل');
      return false;
    }
    if (!formData.motivation.trim()) {
      setError('سبب الرغبة في الانضمام مطلوب');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Import API function
      const api = (await import('../../../lib/api')).default;

      // Check if we have a token and set it in API headers
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (token) {
        // Ensure token is set in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        setError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      // Send application data to backend
      const response = await api.post('/auth/apply-creator', {
        name: formData.name,
        portfolio: formData.portfolio,
        experience: formData.experience,
        specialties: formData.specialties,
        motivation: formData.motivation,
        phone: `${formData.countryCode}${formData.phone}`,
        countryCode: formData.countryCode,
      });

      if (response.data.success) {
        // Update the user data in AuthContext with the new creatorStatus
        await refreshUserData(); // Force refresh user data to get updated creatorStatus
        try {
          localStorage.removeItem('creatorApplyDraft');
        } catch (storageError) {
          console.error('Failed to clear creator application draft after submit:', storageError);
        }
        setFormData(createInitialFormData());
        setCustomSpecialty('');
        setShowCustomInput(false);
        setPhoneError('');
        setSuccess(true);
      } else {
        setError(response.data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      // Handle validation errors specifically
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;

        // Show the first validation error
        const firstError = validationErrors[0];
        setError(firstError.msg || 'بيانات غير صحيحة');
      } else {
        setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    }

    setLoading(false);
  };

  // Check if user already has a pending or approved creator status
  if (user?.creatorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Pending Status */}
        <div className="container-custom py-8 sm:py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-0">
            <div className="card p-4 sm:p-6 md:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-3 sm:mb-4">
                طلبك قيد المراجعة
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                تم استلام طلبك للانضمام كمبدع وهو قيد المراجعة حالياً. سنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={async () => {
                    try {
                      await checkAuthStatus();
                    } catch (error) {
                      console.error('Failed to refresh status:', error);
                    }
                  }}
                  className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  تحديث الحالة
                </button>
                <Link href="/creators" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.creatorStatus === 'approved') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Navigation */}
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-3 sm:py-4 px-4 sm:px-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <Link href="/profile" className="text-white hover:text-gray-300 transition-colors text-sm sm:text-base">
              الملف الشخصي
            </Link>
          </div>
        </nav>

        {/* Approved Status */}
        <div className="container-custom py-8 sm:py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-0">
            <div className="card p-4 sm:p-6 md:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-3 sm:mb-4">
                مبروك! أنت الآن مبدع معتمد
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                تم قبول طلبك للانضمام كمبدع. يمكنك الآن الوصول إلى لوحة التحكم والبدء في إنشاء وبيع قوالبك.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/profile" className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-center">
                  لوحة التحكم
                </Link>
                <Link href="/creators" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.creatorStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Rejected Status */}
        <div className="container-custom py-8 sm:py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-0">
            <div className="card p-4 sm:p-6 md:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-3 sm:mb-4">
                لم يتم قبول طلبك
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                نأسف، لم يتم قبول طلبك للانضمام كمبدع في هذا الوقت. يمكنك المحاولة مرة أخرى في المستقبل.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/creators" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state only if user doesn't have a pending status yet
  if (success && user?.creatorStatus !== 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Success Message */}
        <div className="container-custom py-8 sm:py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-0">
            <div className="card p-4 sm:p-6 md:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-3 sm:mb-4">
                تم إرسال طلبك بنجاح!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                شكراً لك على اهتمامك بالانضمام إلى مجتمع المبدعين. سنراجع طلبك وسنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/creators" className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary transition-colors duration-300" dir="rtl">
      {/* Main Content */}
      <div className="container-custom py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
              انضم إلى مجتمع المبدعين
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              شارك مواهبك مع العالم وابدأ في إنشاء وبيع قوالب نوشن احترافية.
              <br className="hidden sm:block" />
              كن جزءاً من مجتمع المبدعين الرائدين في المنطقة العربية
            </p>

            {/* Benefits Section */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-dark-card-border">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">دعم فني مستمر</span>
              </div>
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-dark-card-border">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">مجتمع نشط</span>
              </div>
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-dark-card-border sm:col-span-2 md:col-span-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">جودة عالية</span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 md:space-y-12">
              {/* Personal Information */}
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-orange-400">
                    المعلومات الشخصية
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      الاسم الكامل *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">يمكنك تعديل اسمك إذا كان مختلفاً عن الاسم المسجل في حسابك</span>
                      <span className="sm:hidden">يمكن تعديل الاسم</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg sm:rounded-xl transition-all duration-200 cursor-not-allowed"
                        placeholder="example@email.com"
                        required
                        disabled={isAuthenticated}
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">هذا الحقل مملوء تلقائياً من حسابك ولا يمكن تعديله</span>
                      <span className="sm:hidden">مملوء تلقائياً</span>
                    </p>
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      رقم الهاتف *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Phone Number Input */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onKeyDown={handlePhoneKeyDown}
                          className={`form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 rounded-lg sm:rounded-xl transition-all duration-200 w-full ${phoneError
                            ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500'
                            : 'border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 hover:border-primary-300 dark:hover:border-orange-400'
                            }`}
                          placeholder="50 123 4567"
                          required
                        />
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>

                      {/* Country Code Dropdown */}
                      <div className="relative w-full sm:w-48" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full pr-3 sm:pr-4 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl appearance-none text-right flex items-center"
                        >
                          <span className="flex-1 text-right truncate pr-2 sm:pr-8 text-xs sm:text-base">
                            <span className="hidden sm:inline">{countryOptions.find(c => c.code === formData.countryCode)?.name || 'Egypt'} ({formData.countryCode})</span>
                            <span className="sm:hidden">({formData.countryCode})</span>
                          </span>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <ReactCountryFlag
                              countryCode={countryOptions.find(c => c.code === formData.countryCode)?.countryCode || 'EG'}
                              svg
                              style={{ width: '16px', height: '12px' }}
                              className="sm:w-5 sm:h-4"
                            />
                          </div>
                        </button>

                        {/* Dropdown Options */}
                        {isCountryDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg sm:rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {countryOptions.map((country, index) => (
                              <button
                                key={`${country.code}-${country.name}-${index}`}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-right flex items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200 first:rounded-t-lg sm:first:rounded-t-xl last:rounded-b-lg sm:last:rounded-b-xl"
                              >
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-secondary flex-1 text-right truncate">
                                  {country.name} ({country.code})
                                </span>
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
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {phoneError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span className="hidden sm:inline">اختر رمز البلد وأدخل رقم هاتفك بدون رمز البلد</span>
                      <span className="sm:hidden">اختر رمز البلد وأدخل رقم الهاتف</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-orange-400">
                    المعلومات المهنية
                  </h2>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    رابط المعرض أو الأعمال السابقة
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://example.com/portfolio (اختياري)"
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="hidden sm:inline">يمكنك مشاركة موقعك الشخصي أو أي منصة أخرى تعرض أعمالك</span>
                    <span className="sm:hidden">رابط المعرض أو الأعمال السابقة (اختياري)</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    وصف خبرتك في التصميم أو إنشاء القوالب *
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={4}
                    className="form-input px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none"
                    placeholder="أخبرنا عن خبرتك في مجال التصميم، عدد سنوات العمل، والمشاريع التي عملت عليها..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="hidden sm:inline">شاركنا تفاصيل عن خبرتك، المشاريع التي عملت عليها، وأي إنجازات مهمة</span>
                    <span className="sm:hidden">شاركنا تفاصيل عن خبرتك ومشاريعك</span>
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3 sm:mb-4">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    المجالات التي تختص بها *
                  </label>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    <span className="hidden sm:inline">اختر المجالات التي تبرع فيها (يمكنك اختيار أكثر من مجال)</span>
                    <span className="sm:hidden">اختر المجالات التي تبرع فيها</span>
                  </p>

                  {/* Specialty Dropdown */}
                  <div className="relative" ref={specialtyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                      className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl appearance-none text-right flex items-center"
                    >
                      <span className="flex-1 text-right text-sm sm:text-base">
                        {formData.specialties.length > 0
                          ? formData.specialties.join('، ')
                          : 'اختر المجالات التي تختص بها'
                        }
                      </span>
                    </button>

                    {/* Dropdown Options */}
                    {isSpecialtyDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg sm:rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {specialtyOptions.map((specialty) => (
                          <button
                            key={specialty}
                            type="button"
                            onClick={() => handleSpecialtySelect(specialty)}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-right flex items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200 first:rounded-t-lg sm:first:rounded-t-xl last:rounded-b-lg sm:last:rounded-b-xl ${formData.specialties.includes(specialty)
                              ? 'bg-primary-50 dark:bg-orange-900/20 text-primary-700 dark:text-orange-300'
                              : 'text-gray-700 dark:text-dark-text-secondary'
                              }`}
                          >
                            <span className="text-xs sm:text-sm font-medium flex-1 text-right">
                              {specialty}
                            </span>
                            {formData.specialties.includes(specialty) && (
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Specialties Display */}
                  {formData.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {formData.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 dark:bg-orange-900/30 text-primary-800 dark:text-orange-300"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => handleSpecialtySelect(specialty)}
                            className="mr-1 sm:mr-2 text-primary-600 dark:text-orange-400 hover:text-primary-800 dark:hover:text-orange-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Custom Specialty Input */}
                  {showCustomInput && (
                    <div className="mt-3 sm:mt-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        اكتب مجالك الخاص
                      </label>
                      <input
                        type="text"
                        name="customSpecialty"
                        value={customSpecialty}
                        onChange={handleChange}
                        onBlur={handleCustomSpecialtyBlur}
                        onKeyDown={handleCustomSpecialtyKeyDown}
                        className="form-input px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 w-full"
                        placeholder="مثال: التصميم المعماري، الطب، الهندسة"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="hidden sm:inline">اكتب المجال الذي تبرع فيه إذا لم يكن موجوداً في القائمة أعلاه. يمكنك إضافة عدة تخصصات مفصولة بفاصلة (مثل: الطب، الهندسة، التصميم)</span>
                        <span className="sm:hidden">يمكنك إضافة عدة تخصصات مفصولة بفاصلة</span>
                      </p>
                    </div>
                  )}

                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    لماذا تريد الانضمام إلى مجتمع المبدعين؟ *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    rows={3}
                    className="form-input px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none"
                    placeholder="أخبرنا عن دوافعك وأهدافك من الانضمام إلى المنصة..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span className="hidden sm:inline">شاركنا رؤيتك وأهدافك من الانضمام إلى مجتمع المبدعين</span>
                    <span className="sm:hidden">شاركنا رؤيتك وأهدافك</span>
                  </p>
                </div>
              </div>



              {/* Terms and Conditions */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-card-border">
                  <label className="flex items-center space-x-3 sm:space-x-4 space-x-reverse cursor-pointer group text-right">
                    <div className="relative flex-shrink-0 ml-1">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${formData.agreeToTerms
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                        }`}>
                        {formData.agreeToTerms && (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-right leading-relaxed">
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-dark-text-secondary">
                        أوافق على{' '}
                        <Link href="/terms" className="text-primary-600 dark:text-orange-400 hover:underline font-medium">
                          الشروط والأحكام
                        </Link>
                        {' '}و{' '}
                        <Link href="/privacy" className="text-primary-600 dark:text-orange-400 hover:underline font-medium">
                          سياسة الخصوصية
                        </Link>
                        {' '}وأوافق على أن جميع المعلومات المقدمة صحيحة ومكتملة
                      </span>
                    </div>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
                  <Link href="/" className="btn-secondary text-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    إلغاء
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">جاري الإرسال...</span>
                        <span className="sm:hidden">جاري الإرسال</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="hidden sm:inline">إرسال الطلب</span>
                        <span className="sm:hidden">إرسال</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
