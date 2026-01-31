// Comprehensive phone number validation patterns for all countries
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
    '+252': /^[6-7]\d{7}$/, // Somalia: 8 digits starting with 6-7
    '+253': /^[7]\d{7}$/, // Djibouti: 8 digits starting with 7
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
};

/**
 * Validates a phone number for a given country code
 * @param {string} phone - The phone number to validate (without country code)
 * @param {string} countryCode - The country code (e.g., '+20', '+1')
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePhoneNumber(phone, countryCode) {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    const pattern = phonePatterns[countryCode];
    if (!pattern) {
        // For countries without specific patterns, check if it's a reasonable length (7-15 digits)
        return cleanPhone.length >= 7 && cleanPhone.length <= 15;
    }

    return pattern.test(cleanPhone);
}
