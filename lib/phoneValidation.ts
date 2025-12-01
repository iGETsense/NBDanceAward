/**
 * Phone number validation utilities for African mobile operators
 * Supports MTN, Orange, and other operators across Africa
 * Flexible approach: accepts all numbers, provides smart suggestions
 */

export type MobileOperator = 'mtn' | 'orange' | 'other' | 'unknown'

interface ValidationResult {
    isValid: boolean
    operator: MobileOperator
    formattedNumber: string
    suggestion?: string
    warning?: string
}

// Known operator prefixes for Cameroon (can be extended for other countries)
const CAMEROON_PREFIXES = {
    mtn: ['67', '650', '651', '652', '653', '654', '680', '681', '682', '683'],
    orange: ['69', '655', '656', '657', '658', '659'],
    other: ['62', '642', '643'] // Camtel and others
}

/**
 * Clean phone number by removing all non-digit characters except +
 */
export function cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^\d+]/g, '')
}

/**
 * Detect mobile operator from phone number (Cameroon-focused)
 * Returns 'other' for valid but unknown operators (pan-African support)
 */
export function detectOperator(phone: string): MobileOperator {
    const cleaned = cleanPhoneNumber(phone)

    // Remove country code if present
    const number = cleaned.startsWith('+237') ? cleaned.slice(4) : cleaned
    const number237 = cleaned.startsWith('237') ? number.slice(3) : number

    // Check Cameroon MTN prefixes
    for (const prefix of CAMEROON_PREFIXES.mtn) {
        if (number237.startsWith(prefix)) {
            return 'mtn'
        }
    }

    // Check Cameroon Orange prefixes
    for (const prefix of CAMEROON_PREFIXES.orange) {
        if (number237.startsWith(prefix)) {
            return 'orange'
        }
    }

    // Check other known Cameroon operators
    for (const prefix of CAMEROON_PREFIXES.other) {
        if (number237.startsWith(prefix)) {
            return 'other'
        }
    }

    // If number is valid length but operator unknown, it's likely from another African country
    const digitsOnly = number237.replace(/\D/g, '')
    if (digitsOnly.length >= 8 && digitsOnly.length <= 10) {
        return 'other' // Valid African number, unknown operator
    }

    return 'unknown'
}

/**
 * Format phone number intelligently
 * Supports various African formats
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = cleanPhoneNumber(phone)

    // Extract country code and number
    let countryCode = ''
    let number = cleaned

    if (cleaned.startsWith('+')) {
        const match = cleaned.match(/^\+(\d{1,3})(.*)/)
        if (match) {
            countryCode = match[1]
            number = match[2].replace(/\D/g, '')
        }
    } else if (cleaned.match(/^\d{3}/)) {
        // Might start with country code without +
        const possibleCode = cleaned.slice(0, 3)
        if (['237', '234', '254', '255', '256'].includes(possibleCode)) {
            countryCode = possibleCode
            number = cleaned.slice(3).replace(/\D/g, '')
        } else {
            number = cleaned.replace(/\D/g, '')
        }
    } else {
        number = cleaned.replace(/\D/g, '')
    }

    // Default to Cameroon if no country code
    if (!countryCode && number.length > 0) {
        countryCode = '237'
    }

    // Format based on length
    if (number.length >= 9) {
        return `+${countryCode} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)}`
    } else if (number.length >= 6) {
        return `+${countryCode} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
    } else if (number.length >= 3) {
        return `+${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`
    } else if (number.length > 0) {
        return `+${countryCode} ${number}`
    }

    return `+${countryCode} `
}

/**
 * Validate phone number with flexible, pan-African approach
 * ONLY accepts MTN and Orange (payment aggregator limitation)
 * NOTE: Payment aggregator (Mesomb) auto-detects operator, so no need to match payment method
 */
export function validatePhoneNumber(
    phone: string,
    selectedPaymentMethod?: 'mobile' | 'orange'
): ValidationResult {
    const cleaned = cleanPhoneNumber(phone)

    // Extract just the phone number digits
    let number = cleaned.replace(/^\+?\d{1,3}/, '').replace(/\D/g, '')

    // African mobile numbers are typically 8-10 digits
    if (number.length < 8) {
        return {
            isValid: false,
            operator: 'unknown',
            formattedNumber: formatPhoneNumber(phone),
            warning: 'Le numéro semble incomplet (minimum 8 chiffres)'
        }
    }

    if (number.length > 10) {
        return {
            isValid: false,
            operator: 'unknown',
            formattedNumber: formatPhoneNumber(phone),
            warning: 'Le numéro semble trop long (maximum 10 chiffres)'
        }
    }

    // Detect operator
    const detectedOperator = detectOperator(phone)

    // CRITICAL: Only MTN and Orange are supported by payment aggregator
    if (detectedOperator === 'other') {
        return {
            isValid: false,
            operator: 'other',
            formattedNumber: formatPhoneNumber(phone),
            warning: 'Seuls les numéros MTN et Orange Money sont acceptés pour le moment'
        }
    }

    if (detectedOperator === 'unknown') {
        return {
            isValid: false,
            operator: 'unknown',
            formattedNumber: formatPhoneNumber(phone),
            warning: 'Numéro non reconnu. Veuillez utiliser un numéro MTN (67, 650-654, 680-683) ou Orange (69, 655-659)'
        }
    }

    // All good! Mesomb will auto-detect the operator
    return {
        isValid: true,
        operator: detectedOperator,
        formattedNumber: formatPhoneNumber(phone),
    }
}

/**
 * Get operator display name
 */
export function getOperatorName(operator: MobileOperator): string {
    switch (operator) {
        case 'mtn':
            return 'MTN MoMo'
        case 'orange':
            return 'Orange Money'
        case 'other':
            return 'Mobile Money'
        default:
            return ''
    }
}

/**
 * Get operator color for UI
 */
export function getOperatorColor(operator: MobileOperator): string {
    switch (operator) {
        case 'mtn':
            return 'text-yellow-500'
        case 'orange':
            return 'text-orange-500'
        case 'other':
            return 'text-green-500'
        default:
            return 'text-gray-500'
    }
}

/**
 * Suggest payment method based on detected operator
 */
export function suggestPaymentMethod(phone: string): 'mobile' | 'orange' | null {
    const operator = detectOperator(phone)

    if (operator === 'mtn') return 'mobile'
    if (operator === 'orange') return 'orange'

    return null // No suggestion for other operators
}
