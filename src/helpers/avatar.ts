// Several frontend slices (ConnectionUser, DiscoverAttendee, Profile) expect
// `initials` and `color` fields for avatar fallback UI. Neither is stored on
// User/Attendee — they're derived deterministically here so the same user
// always renders the same initials/color across requests.

const PALETTE = [
    '#F87171', '#FB923C', '#FBBF24', '#A3E635',
    '#34D399', '#22D3EE', '#60A5FA', '#818CF8',
    '#A78BFA', '#F472B6', '#FB7185', '#2DD4BF',
];

export const getInitials = (name: string | undefined | null): string => {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
};

export const getColorForId = (id: string | undefined | null): string => {
    if (!id) return PALETTE[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
};
