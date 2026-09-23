// Auth Constants
export const ADMIN_EMAIL = "connect@ethyra.in";
export const ADMIN_PASSWORD = "ethyrians@7729";
export const ADMIN_SESSION_KEY = "ethyra_admin_session";
export const USER_SESSION_KEY = "ethyra_user_session";
export const PAYMENT_AMOUNT = 149;
export const FREE_USER_LIMIT = 5;

// OTP Store (in-memory)
const otpStore = {};

// --- Admin Auth ---
export function loginAdmin(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = btoa(`${email}:${Date.now()}`);
        localStorage.setItem(ADMIN_SESSION_KEY, token);
        return { success: true, token };
    }
    return { success: false, error: "Invalid credentials" };
}

export function getAdminSession() {
    const token = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!token) return null;
    try {
        const decoded = atob(token);
        return { token, email: decoded.split(":")[0] };
    } catch {
        return null;
    }
}

export function isAdminLoggedIn() {
    return !!getAdminSession();
}

export function logoutAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
}

// --- User Auth ---
export function loginUser(userData) {
    const session = {
        id: userData.id,
        fullName: userData.fullName,
        phone: userData.phone,
        email: userData.email,
        organizationName: userData.organizationName,
        token: btoa(`${userData.email}:${Date.now()}`),
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    return session;
}

export function getUserSession() {
    try {
        const raw = localStorage.getItem(USER_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function isUserLoggedIn() {
    return !!getUserSession();
}

export function updateUserSession(updates) {
    const session = getUserSession();
    if (!session) return null;
    const updated = { ...session, ...updates };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    return updated;
}

export function logoutUser() {
    localStorage.removeItem(USER_SESSION_KEY);
}

// --- Validation ---
export function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- OTP ---
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(identifier, otp) {
    otpStore[identifier] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
        attempts: 0,
    };
}

export function verifyOTP(identifier, inputOtp) {
    const record = otpStore[identifier];
    if (!record) return { success: false, error: "OTP not found" };
    if (Date.now() > record.expiresAt) return { success: false, error: "OTP expired" };
    if (record.attempts >= 5) return { success: false, error: "Max attempts reached" };
    record.attempts++;
    if (record.otp === inputOtp) {
        delete otpStore[identifier];
        return { success: true };
    }
    return { success: false, error: "Invalid OTP" };
}

export function clearOTP(identifier) {
    delete otpStore[identifier];
}
