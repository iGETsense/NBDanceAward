/**
 * Vote Validation Service
 * Server-side validation for vote submissions
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate Cameroon phone number
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
    // Remove spaces and country code
    const cleaned = phoneNumber.replace(/\s/g, '').replace(/^\+237/, '');

    // Cameroon numbers: 6xx xxx xxx (9 digits starting with 6)
    const phoneRegex = /^6\d{8}$/;

    if (!phoneRegex.test(cleaned)) {
        return {
            valid: false,
            error: 'Invalid phone number format. Must be a Cameroon number (6xx xxx xxx)',
        };
    }

    return { valid: true };
}

/**
 * Detect mobile operator from phone number
 */
export function detectOperator(phoneNumber: string): 'MTN' | 'ORANGE' | 'UNKNOWN' {
    const cleaned = phoneNumber.replace(/\s/g, '').replace(/^\+237/, '');

    // MTN prefixes: 650-654, 670-679, 680-689
    const mtnPrefixes = ['650', '651', '652', '653', '654', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689'];

    // Orange prefixes: 655-659, 690-699
    const orangePrefixes = ['655', '656', '657', '658', '659', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699'];

    const prefix = cleaned.substring(0, 3);

    if (mtnPrefixes.includes(prefix)) {
        return 'MTN';
    } else if (orangePrefixes.includes(prefix)) {
        return 'ORANGE';
    }

    return 'UNKNOWN';
}

/**
 * Validate payment method matches phone operator
 */
export function validatePaymentMethod(phoneNumber: string, paymentMethod: string): ValidationResult {
    const operator = detectOperator(phoneNumber);

    if (operator === 'UNKNOWN') {
        return {
            valid: false,
            error: 'Unsupported operator. Only MTN and Orange Money are accepted.',
        };
    }

    const expectedMethod = operator === 'MTN' ? 'mobile' : 'orange';

    if (paymentMethod !== expectedMethod) {
        return {
            valid: false,
            error: `Phone number is ${operator} but payment method is ${paymentMethod.toUpperCase()}. Please select the correct payment method.`,
        };
    }

    return { valid: true };
}

/**
 * Validate vote count
 */
export function validateVoteCount(voteCount: number): ValidationResult {
    if (!Number.isInteger(voteCount) || voteCount < 1 || voteCount > 100) {
        return {
            valid: false,
            error: 'Vote count must be between 1 and 100',
        };
    }

    return { valid: true };
}

/**
 * Validate candidate ID exists
 */
export async function validateCandidateExists(candidateId: string, admin: any): Promise<ValidationResult> {
    try {
        const snapshot = await admin.database().ref(`candidates/${candidateId}`).once('value');

        if (!snapshot.exists()) {
            return {
                valid: false,
                error: 'Candidate not found',
            };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: 'Error validating candidate',
        };
    }
}
