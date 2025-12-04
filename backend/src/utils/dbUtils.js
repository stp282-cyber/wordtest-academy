/**
 * Database Utilities
 */

/**
 * Converts Oracle DB row keys (UPPERCASE) to camelCase
 * @param {Object} row - The database row object
 * @returns {Object} - The normalized object with camelCase keys
 */
const normalizeRow = (row) => {
    if (!row) return null;

    const normalized = {};
    Object.keys(row).forEach(key => {
        // Convert UPPER_CASE to camelCase
        // e.g. ACADEMY_ID -> academyId, CREATED_AT -> createdAt
        // But for simple fields like ID, NAME, it becomes id, name.
        // Special handling might be needed if we want exact mapping, 
        // but usually converting to lowercase is a good start, or camelCase.

        // Simple lowercase strategy for now as most fields are simple
        // or snake_case in DB but we want snake_case or camelCase in JS?
        // The current User.js maps ACADEMY_ID to academy_id.
        // So we just want lowercase keys.

        const lowerKey = key.toLowerCase();
        normalized[lowerKey] = row[key];
    });
    return normalized;
};

/**
 * Normalizes an array of rows
 * @param {Array} rows 
 * @returns {Array}
 */
const normalizeRows = (rows) => {
    if (!rows) return [];
    return rows.map(normalizeRow);
};

module.exports = {
    normalizeRow,
    normalizeRows
};
