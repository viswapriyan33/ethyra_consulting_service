// Simple in-memory "database" that simulates Base44 BaaS
// In production this would be a real backend

const DB = {
    UserProfile: [],
    AssessmentAnswer: [],
    AssessmentResult: [],
    PaymentRecord: [],
    EmailLog: [],
};

const subscribers = {};

function generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function notify(entity, data) {
    if (subscribers[entity]) {
        subscribers[entity].forEach((cb) => cb(data));
    }
}

// Generic CRUD
export function createRecord(entity, data) {
    const record = {
        ...data,
        id: generateId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
    };
    DB[entity].push(record);
    notify(entity, DB[entity]);
    return record;
}

export function updateRecord(entity, id, updates) {
    const idx = DB[entity].findIndex((r) => r.id === id);
    if (idx === -1) return null;
    DB[entity][idx] = { ...DB[entity][idx], ...updates, updated_date: new Date().toISOString() };
    notify(entity, DB[entity]);
    return DB[entity][idx];
}

export function getRecords(entity, filters = {}) {
    return DB[entity].filter((r) => {
        return Object.entries(filters).every(([k, v]) => r[k] === v);
    });
}

export function getRecord(entity, id) {
    return DB[entity].find((r) => r.id === id) || null;
}

export function subscribe(entity, callback) {
    if (!subscribers[entity]) subscribers[entity] = [];
    subscribers[entity].push(callback);
    return () => {
        subscribers[entity] = subscribers[entity].filter((cb) => cb !== callback);
    };
}

// Scoped helpers
export const UserProfileDB = {
    create: (data) => createRecord("UserProfile", data),
    update: (id, updates) => updateRecord("UserProfile", id, updates),
    findByEmail: (email) => DB.UserProfile.find((u) => u.email === email) || null,
    findById: (id) => DB.UserProfile.find((u) => u.id === id) || null,
    getAll: () => [...DB.UserProfile],
};

export const AssessmentAnswerDB = {
    create: (data) => createRecord("AssessmentAnswer", data),
    findByAttempt: (attemptId) => DB.AssessmentAnswer.filter((a) => a.attemptId === attemptId),
    findByUser: (userProfileId) => DB.AssessmentAnswer.filter((a) => a.userProfileId === userProfileId),
};

export const AssessmentResultDB = {
    create: (data) => createRecord("AssessmentResult", data),
    update: (id, updates) => updateRecord("AssessmentResult", id, updates),
    findByAttempt: (attemptId) => DB.AssessmentResult.find((r) => r.attemptId === attemptId) || null,
    findByUser: (userProfileId) => DB.AssessmentResult.filter((r) => r.userProfileId === userProfileId),
    getAll: () => [...DB.AssessmentResult],
};

export const PaymentRecordDB = {
    create: (data) => createRecord("PaymentRecord", data),
    update: (id, updates) => updateRecord("PaymentRecord", id, updates),
    findByUser: (userProfileId) => DB.PaymentRecord.filter((p) => p.userProfileId === userProfileId),
    findByAttempt: (attemptId) => DB.PaymentRecord.filter((p) => p.attemptId === attemptId),
    findSuccessForUser: (userProfileId) => DB.PaymentRecord.filter((p) => p.userProfileId === userProfileId && p.status === "success"),
    getAll: () => [...DB.PaymentRecord],
    subscribe: (cb) => subscribe("PaymentRecord", cb),
};

export const EmailLogDB = {
    create: (data) => createRecord("EmailLog", data),
    getAll: () => [...DB.EmailLog],
};
