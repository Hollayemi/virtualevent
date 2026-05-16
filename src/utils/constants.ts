export const INTENTION_TAGS = [
    'Hiring',
    'Investment',
    'Partnership',
    'Mentorship',
    'Sales',
    'Collaboration',
] as const;

export type IntentionTag = (typeof INTENTION_TAGS)[number];

export const ACCOUNT_TYPES = ['user', 'organiser'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const CONNECTION_STATUSES = ['pending', 'accepted', 'declined'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

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
