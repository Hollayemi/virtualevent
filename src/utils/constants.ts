// NOTE: aligned 1:1 with frontend `ConnectionIntent` (connection.slice.ts).
// 'Collaboration' was dropped and 'Fundraising' / 'Just exploring' were added
// to match the frontend contract exactly. If any existing Connection docs use
// 'Collaboration', migrate them (see GAP_ANALYSIS.md) before deploying.
export const INTENTION_TAGS = [
    'Fundraising',
    'Hiring',
    'Partnership',
    'Investment',
    'Mentorship',
    'Sales',
    'Just exploring',
] as const;

export type IntentionTag = (typeof INTENTION_TAGS)[number];

export const ACCOUNT_TYPES = ['user', 'organiser'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

// 'cancelled' added so a requester can withdraw a pending request
// (frontend: cancelConnectionRequest / CancelSentRequestResponse).
export const CONNECTION_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

// Fixed 3-tier bucket exposed to the frontend (Connection/Discover/Profile
// slices all type `tier` as this union). Backend events actually define
// arbitrary per-event tiers (see Event.model ITier), so this is derived —
// see helpers/tier.ts `bucketTier()`.
export const TIER_BUCKETS = ['Regular', 'Premium', 'VIP'] as const;
export type TierBucket = (typeof TIER_BUCKETS)[number];

export const EVENT_STATUSES = ['draft', 'published', 'ended'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const REGISTRATION_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const CUSTOM_FIELD_TYPES = [
    'text',
    'textarea',
    'select',
    'checkbox',
    'url',
    'number',
] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export const LOCATION_TYPES = ['physical', 'virtual', 'hybrid'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];
