export const validators = {
    isValidColor(color: string): boolean {
        return /^#[0-9A-F]{6}$/i.test(color);
    },

    isNonEmptyString(value: string): boolean {
        return typeof value === 'string' && value.trim().length > 0;
    },

    isValidUUID(id: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    }
};