import { Insets, StyleSheet } from 'react-native';

// Shared hitSlop presets
export const HIT_SLOP_8: Insets = { top: 8, bottom: 8, left: 8, right: 8 };
export const HIT_SLOP_6_4: Insets = { top: 6, bottom: 6, left: 4, right: 4 };
export const HIT_SLOP_5: Insets = { top: 5, bottom: 5, left: 5, right: 5 };

// Static, theme-independent styles shared across the app.
export const globalStyles = StyleSheet.create({
    // Layout
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        marginTop: -8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 6,
        gap: 8,
    },

    // Icon buttons (pressed-circle pattern)
    iconButton: {
        padding: 8,
        borderRadius: 999,
    },

    // Settings-style rows (icon tile + text column)
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    rowIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {
        flex: 1,
        gap: 3,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    hairlineDivider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },

    // Modal forms
    modalContainer: {
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 14,
        gap: 10,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    modalDivider: {
        height: 1.8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.9,
    },
    btnRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 14,
        gap: 14,
    },
    btnCancel: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    btnSave: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Label modals
    accentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 3,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 4,
    },
    labelTextInput: {
        height: 48,
        maxHeight: 48,
        fontSize: 15,
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    clearIcon: {
        position: 'absolute',
        right: 14,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
});
