/**
 * Simple session store for the Privacy Key (CryptoKey).
 * Key is never stored in localStorage/sessionStorage.
 * Wiped on page refresh.
 */

let activeKey: CryptoKey | null = null;
let keyStatus: 'locked' | 'unlocked' = 'locked';

export function setPrivacyKey(key: CryptoKey | null) {
    activeKey = key;
    keyStatus = key ? 'unlocked' : 'locked';
}

export function getPrivacyKey(): CryptoKey | null {
    return activeKey;
}

export function getPrivacyStatus(): 'locked' | 'unlocked' {
    return keyStatus;
}
