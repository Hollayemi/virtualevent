import { TierBucket } from '../utils/constants';

/**
 * The frontend (`ConnectionUser.tier`, `DiscoverAttendee.tier`, `Profile.tier`)
 * expects a fixed 3-value union: 'Regular' | 'Premium' | 'VIP'.
 *
 * The backend's actual data model does NOT have a global user tier — tiers are
 * defined per-event (Event.tiers[]), each with a free-form `label` and `price`,
 * and a single `isVIP` flag on the highest-priced tier (see Event.model.ts).
 *
 * This helper buckets a per-event tier snapshot into the fixed union so API
 * responses satisfy the frontend contract:
 *   - isVIP === true            -> 'VIP'
 *   - price > 0 (not top tier)  -> 'Premium'
 *   - price === 0               -> 'Regular'
 *
 * If your product intends tier to be a real per-user attribute rather than
 * derived per-event, replace this with a stored field instead (see
 * GAP_ANALYSIS.md, "Tier modeling").
 */
export const bucketTier = (input: { isVIP?: boolean; price?: number } | null | undefined): TierBucket => {
    if (!input) return 'Regular';
    if (input.isVIP) return 'VIP';
    if ((input.price ?? 0) > 0) return 'Premium';
    return 'Regular';
};
