/**
 * Vote Link Utilities
 * Generate and decode secure direct vote links for candidates
 */

/**
 * Encode a candidate ID into a URL-safe format
 * Uses Base64 encoding for obfuscation
 */
export function encodeVoteLink(candidateId: string): string {
    if (!candidateId) return '';

    try {
        // Convert to Base64 and make URL-safe
        const encoded = Buffer.from(candidateId).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        return encoded;
    } catch (error) {
        console.error('Error encoding vote link:', error);
        return '';
    }
}

/**
 * Decode a vote link parameter back to candidate ID
 * Returns null if invalid
 */
export function decodeVoteLink(encoded: string): string | null {
    if (!encoded) return null;

    try {
        // Restore Base64 format
        let base64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Add padding if needed
        while (base64.length % 4) {
            base64 += '=';
        }

        // Decode from Base64
        const decoded = Buffer.from(base64, 'base64').toString('utf-8');

        // Basic validation: should be alphanumeric with hyphens
        if (!/^[a-zA-Z0-9-_]+$/.test(decoded)) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Error decoding vote link:', error);
        return null;
    }
}

/**
 * Generate a full vote URL for a candidate
 */
export function generateVoteUrl(candidateId: string, baseUrl?: string): string {
    const encoded = encodeVoteLink(candidateId);
    if (!encoded) return '';

    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/?vote=${encoded}`;
}

/**
 * Client-side version using browser APIs
 */
export function encodeVoteLinkClient(candidateId: string): string {
    if (!candidateId) return '';

    try {
        const encoded = btoa(candidateId)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        return encoded;
    } catch (error) {
        console.error('Error encoding vote link:', error);
        return '';
    }
}

export function decodeVoteLinkClient(encoded: string): string | null {
    if (!encoded) return null;

    try {
        let base64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        while (base64.length % 4) {
            base64 += '=';
        }

        const decoded = atob(base64);

        if (!/^[a-zA-Z0-9-_]+$/.test(decoded)) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Error decoding vote link:', error);
        return null;
    }
}
