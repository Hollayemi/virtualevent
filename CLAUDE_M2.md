# CLAUDE.md — Milestone 2: Credit Wallet & VIP Access System

## Context

This is Milestone 2 of the Event Networking Platform.
Milestone 1 delivered: User auth, Organiser auth, Event creation with custom tiers & fields, Registration, and same-tier Connection requests.

**Do not re-scaffold Milestone 1 code.** Build only what is described here. All existing patterns, conventions, and utilities from Milestone 1 apply.

---

## What We Are Building

The credit economy — the commercial and social layer of the platform.

Users earn, purchase, and spend credits to unlock premium networking interactions. VIP attendees (highest-priced tier in any event) can enable protection mode — requiring credit spend from lower-tier users who want to connect. When a VIP accepts such a request, they receive a cashback cut. Admins define the cashback ratio and create credit packages. Credits are also awarded for actions like event registration.

---

## New Modules

```
src/
├── models/
│   ├── Wallet.model.ts           # Per-user credit balance + transaction log
│   ├── CreditPackage.model.ts    # Admin-defined purchasable credit packs
│   ├── CreditTransaction.model.ts  # Immutable ledger of every credit movement
│   └── CreditConfig.model.ts     # Admin-controlled global settings (cashback ratio, reward amounts)
├── services/
│   ├── wallet.service.ts
│   ├── creditPackage.service.ts
│   ├── creditTransaction.service.ts
│   └── creditConfig.service.ts
├── controllers/
│   ├── wallet.controller.ts
│   ├── creditPackage.controller.ts
│   └── creditConfig.controller.ts
├── routes/
│   ├── wallet.routes.ts
│   ├── creditPackage.routes.ts
│   └── creditConfig.routes.ts
└── helpers/
    └── credit.validation.schemas.ts   # Zod schemas for this milestone
```

**Modified files from Milestone 1:**
- `src/models/Connection.model.ts` — add `creditCost`, `wasVipGated` fields
- `src/services/connection.service.ts` — enforce VIP gate logic, debit/credit wallet on request send/accept
- `src/models/Registration.model.ts` — add `referredBy` field (userId of referrer)
- `src/services/registration.service.ts` — trigger registration credit reward after confirmed registration

---

## Data Models

### 1. `Wallet` Model

One wallet per user. Created automatically when a user registers (handle this in `user.service.ts` — after creating the user, create their wallet).

**Fields:**
- `userId` — `ObjectId`, ref `User`, required, unique
- `balance` — number, default `0`, min `0` — current spendable credits
- `totalEarned` — number, default `0` — lifetime credits earned (purchases + rewards + cashback)
- `totalSpent` — number, default `0` — lifetime credits spent on requests
- `createdAt`, `updatedAt` — timestamps

**Model Methods:**
- `credit(amount: number, session?: ClientSession): Promise<IWalletDocument>` — increments `balance` and `totalEarned`. Throws if amount ≤ 0.
- `debit(amount: number, session?: ClientSession): Promise<IWalletDocument>` — decrements `balance` and increments `totalSpent`. Throws `AppError` (400) `"Insufficient credits"` if `balance < amount`. Throws if amount ≤ 0.
- `hasSufficientBalance(amount: number): boolean` — returns `balance >= amount`

**Index:** unique on `userId`

---

### 2. `CreditPackage` Model

Admin-defined purchasable packages. Users buy these to top up their wallet.

**Fields:**
- `name` — string, required — e.g. "Starter", "Professional", "Premium"
- `description` — string, optional
- `credits` — number, required, min 1 — how many credits the user receives
- `price` — number, required, min 0 — price in the platform's base currency (e.g. NGN, USD)
- `currency` — string, default `'NGN'`
- `isActive` — boolean, default `true` — soft disable without deleting
- `isPopular` — boolean, default `false` — UI badge hint ("Most Popular")
- `sortOrder` — number, default `0` — for display ordering
- `createdBy` — `ObjectId`, ref `Organiser` OR a separate Admin model (use string `'admin'` for now — defer full admin auth to a later milestone, guard these routes with a simple `ADMIN_SECRET` header check)
- `createdAt`, `updatedAt` — timestamps

**No model methods needed** — simple CRUD.

---

### 3. `CreditTransaction` Model

Immutable ledger. Every credit movement (earn, spend, cashback, purchase) creates one record. Never update or delete these.

**Fields:**
- `userId` — `ObjectId`, ref `User`, required
- `type` — enum: `'purchase' | 'spend' | 'earn' | 'cashback' | 'refund'`, required
- `amount` — number, required — always positive; direction implied by `type`
- `balanceBefore` — number, required — wallet balance before this transaction
- `balanceAfter` — number, required — wallet balance after this transaction
- `description` — string, required — human-readable note, e.g. `"Purchased Starter Pack"`, `"Connection request to @John (Investment)"`, `"Cashback from accepted VIP request"`
- `referenceId` — string, optional — links to the related document (packageId, connectionId, registrationId) for auditability
- `referenceModel` — enum: `'CreditPackage' | 'Connection' | 'Registration'`, optional
- `metadata` — `Record<string, any>`, optional — flexible extra data
- `createdAt` — Date, default `Date.now` (no `updatedAt` — immutable)

**Indexes:** `{ userId: 1, createdAt: -1 }`, `{ type: 1 }`, `{ referenceId: 1 }`

**No model methods.** Transactions are written only through `wallet.service.ts` helpers to keep the ledger consistent.

---

### 4. `CreditConfig` Model

A single-document collection (singleton pattern). Admin sets global credit economy rules here.

**Fields:**
- `cashbackRatio` — number, required — fraction of spent credits the VIP receives as cashback. E.g. `0.33` means: user spends 3 credits → VIP earns `floor(3 × 0.33) = 1` credit. Min `0`, max `1`.
- `registrationRewardAmount` — number, default `0` — credits awarded to a user upon confirmed event registration. Set to `0` to disable.
- `referralRewardAmount` — number, default `0` — credits awarded when a referred user registers for their first event. Set to `0` to disable.
- `vipRequestCost` — number, default `3` — default credit cost to send a connection request to a VIP-protected attendee. This is the platform default; future milestones may let organisers override per-event.
- `updatedBy` — string, optional — identifier of the admin who last changed config
- `updatedAt` — Date

**Singleton enforcement:** Only one document should ever exist. Use an `upsert` pattern in the service — never `create`, always `findOneAndUpdate` with `upsert: true`.

**Model Methods:**
- `getCashbackAmount(spentCredits: number): number` — returns `Math.floor(spentCredits * this.cashbackRatio)`

---

### 5. Modifications to `Connection` Model

Add to the existing `IConnection` interface and schema:

```typescript
// New fields on IConnection:
creditCost: number;       // credits spent to send this request (0 if non-VIP request)
wasVipGated: boolean;     // true if the recipient had VIP protection enabled at request time
```

Both default to `0` / `false`. Set them when creating the connection document in the service.

---

### 6. Modifications to `Registration` Model

Add to the existing `IRegistration` interface and schema:

```typescript
referredBy?: Types.ObjectId;   // userId of the referrer, if any
```

Optional. Passed in as a query param or body field at registration time: `?ref=<userId>` or `{ referredBy: "<userId>" }`.

---

### 7. VIP Protection on Users

Add to the `User` model:

```typescript
vipProtectionEnabled: boolean;   // default false
```

Users can toggle this on/off via `PATCH /api/v1/users/me/vip-protection`. Only meaningful when the user holds a VIP-tier registration in at least one active event — but do not enforce this at the model level; enforce in the connection service.

---

## Business Logic Rules

These must all be enforced in `wallet.service.ts` and `connection.service.ts`:

### VIP Gate Flow (enforced in `connection.service.ts → sendConnectionRequest`)

1. Look up the recipient's registration for the event → get their `tierId`.
2. Call `event.getTierById(recipientTierId)` → check `tier.isVIP`.
3. If `tier.isVIP === true` AND `recipient.vipProtectionEnabled === true`:
   - Load `CreditConfig` (singleton).
   - Use `config.vipRequestCost` as the credit cost.
   - Call `requesterWallet.hasSufficientBalance(creditCost)` — if false, throw `AppError(400, "Insufficient credits. You need X credits to connect with this VIP.")`.
   - **Use a Mongoose session/transaction** for the following steps:
     - `requesterWallet.debit(creditCost, session)`
     - Write a `CreditTransaction` record: type `'spend'`, description: `"VIP connection request to [recipientName] ([intentionTag])"`, referenceModel `'Connection'`
     - Set `connection.creditCost = creditCost`, `connection.wasVipGated = true`
4. If `tier.isVIP === false` OR `recipient.vipProtectionEnabled === false`:
   - Proceed with the normal Milestone 1 flow (no credits charged).
   - Set `connection.creditCost = 0`, `connection.wasVipGated = false`.

### VIP Cashback Flow (enforced in `connection.service.ts → respondToConnection`)

When `action === 'accept'` AND `connection.wasVipGated === true`:
- Load `CreditConfig`.
- Calculate: `cashbackAmount = config.getCashbackAmount(connection.creditCost)`
- If `cashbackAmount > 0`, **within a session**:
  - `vipWallet.credit(cashbackAmount, session)`
  - Write a `CreditTransaction` for the VIP: type `'cashback'`, description `"Cashback from accepted request by [requesterName]"`, referenceModel `'Connection'`

### Registration Credit Reward (enforced in `registration.service.ts`)

After a registration is confirmed:
- Load `CreditConfig` → check `config.registrationRewardAmount`.
- If `> 0`:
  - `wallet.credit(amount)`
  - Write `CreditTransaction`: type `'earn'`, description `"Registration reward — [eventName]"`, referenceModel `'Registration'`
- If `referredBy` is provided and this is the user's **first ever** confirmed registration (check `Registration.countDocuments({ userId, status: 'confirmed' })` before creating the new one):
  - After confirming: load `referredBy` user's wallet.
  - Credit them `config.referralRewardAmount` if `> 0`.
  - Write `CreditTransaction` for referrer: type `'earn'`, description `"Referral reward — [newUserName] joined via your link"`

### Credit Purchase Flow (payment callback)

This uses your existing payment initializer. You only need to implement the **callback/webhook handler**.

When the payment gateway confirms a successful payment:
1. Validate the payload (signature/secret check — use whatever pattern your existing payment setup uses).
2. Look up the `CreditPackage` by the `packageId` stored in the payment metadata at initialization time.
3. Verify the package is still active (`isActive === true`).
4. **Within a session**:
   - `wallet.credit(package.credits, session)`
   - Write `CreditTransaction`: type `'purchase'`, amount `package.credits`, description `"Purchased [packageName] — [package.credits] credits"`, referenceModel `'CreditPackage'`, referenceId `package._id`
5. Return `200 OK` to the gateway. Return `200` even on business logic errors (to prevent gateway retries) — log failures internally.

Payment initialization route (`POST /api/v1/wallet/purchase/initiate`): accepts `{ packageId }`, loads the package, calls your existing payment initializer with the amount and a metadata payload that includes `{ packageId, userId }`. Returns the payment URL/reference to the client.

---

## API Route Map

### Wallet

```
GET    /api/v1/wallet/me                    Get own wallet balance + stats (user only)
GET    /api/v1/wallet/me/transactions       Get own transaction history, paginated (user only)
POST   /api/v1/wallet/purchase/initiate     Initiate credit package purchase — calls payment initializer (user only)
POST   /api/v1/wallet/purchase/callback     Payment gateway webhook — confirms purchase & credits wallet (public, sig-verified)
```

### Credit Packages

```
GET    /api/v1/credit-packages              List all active packages (public)
POST   /api/v1/credit-packages             Create a package (admin only)
PATCH  /api/v1/credit-packages/:id         Update a package (admin only)
DELETE /api/v1/credit-packages/:id         Soft-delete (set isActive = false) (admin only)
```

### Credit Config

```
GET    /api/v1/credit-config               Get current platform credit settings (admin only)
PUT    /api/v1/credit-config               Upsert config (admin only) — replaces entire config
```

### VIP Protection Toggle

```
PATCH  /api/v1/users/me/vip-protection     Toggle vipProtectionEnabled on own profile (user only)
       body: { enabled: boolean }
```

---

## Service Responsibilities

### `wallet.service.ts`
- `getOrCreateWallet(userId)` — find wallet or create one (used internally; wallet auto-created on user registration)
- `getWalletByUserId(userId)` — throws 404 if not found
- `getUserTransactions(userId, page, limit)` — paginated transaction history, newest first
- `creditWallet(userId, amount, transactionData, session?)` — calls `wallet.credit()`, writes `CreditTransaction`, returns updated wallet
- `debitWallet(userId, amount, transactionData, session?)` — calls `wallet.debit()` (which throws on insufficient balance), writes `CreditTransaction`, returns updated wallet
- `initiatePurchase(userId, packageId)` — loads package, validates `isActive`, calls existing payment initializer, returns payment data
- `confirmPurchase(payload)` — webhook handler: validates sig, credits wallet, writes transaction

### `creditPackage.service.ts`
- `createPackage(data)` — admin creates a new credit package
- `getActivePackages()` — returns all `isActive: true` packages, sorted by `sortOrder`
- `updatePackage(id, data)` — admin updates
- `deactivatePackage(id)` — sets `isActive = false` (soft delete)

### `creditConfig.service.ts`
- `getConfig()` — returns the singleton config, or a default object if none exists yet
- `upsertConfig(data)` — findOneAndUpdate with upsert, validates ratio is between 0 and 1

---

## Admin Auth Strategy (Milestone 2 Scope)

Full admin role with its own auth is deferred. For now, protect admin routes with a simple API key guard:

```typescript
// src/middleware/adminKey.ts
export const adminKey = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (!key || key !== process.env.ADMIN_SECRET_KEY) {
        return next(new AppError('Admin access required', 403, 'FORBIDDEN'));
    }
    next();
};
```

Add `ADMIN_SECRET_KEY=` to `.env.example`. Apply `adminKey` middleware to all `credit-packages` write routes and all `credit-config` routes.

---

## Transaction Safety

Any operation that touches two wallets at once (VIP gate + cashback) or wallet + transaction log must use a **Mongoose session**:

```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
    // debit requester wallet
    // write CreditTransaction for requester
    // (on accept) credit VIP wallet
    // (on accept) write CreditTransaction for VIP
    await session.commitTransaction();
} catch (err) {
    await session.abortTransaction();
    throw err;
} finally {
    session.endSession();
}
```

Always pass the session into `wallet.credit()` and `wallet.debit()` calls so they participate in the same atomic operation.

---

## Zod Validation Highlights

**Initiate purchase:**
```
{ packageId: string (required, valid ObjectId format) }
```

**Create credit package:**
```
{
  name: string (required, max 60),
  description: string (optional, max 200),
  credits: number (required, integer, min 1),
  price: number (required, min 0),
  currency: string (optional, default 'NGN'),
  isPopular: boolean (optional),
  sortOrder: number (optional, integer, min 0)
}
```

**Upsert credit config:**
```
{
  cashbackRatio: number (required, min 0, max 1),
  registrationRewardAmount: number (required, integer, min 0),
  referralRewardAmount: number (required, integer, min 0),
  vipRequestCost: number (required, integer, min 1)
}
```

**VIP protection toggle:**
```
{ enabled: boolean (required) }
```

---

## Environment Variables to Add

```
# Admin
ADMIN_SECRET_KEY=your-admin-key-here

# Payment (keys already in use from Milestone 1 setup)
PAYMENT_WEBHOOK_SECRET=    # for verifying gateway callback signatures
```

---

## Wallet Auto-Creation

In `user.service.ts → registerUser`, after `User.create(...)`, immediately call `getOrCreateWallet(user.id)`. This ensures every user has a wallet from the moment they register. No manual wallet creation endpoint is needed.

---

## What Is Out of Scope for Milestone 2

- Full admin authentication (deferred — using API key guard for now)
- Messaging system
- Meeting scheduling
- AI matchmaking
- Leaderboard and gamification
- Subscription/SaaS plans for organisers
- Sponsor features
- Credit refunds (the `refund` transaction type is defined in the schema for future use only)
- Cross-event credit transfer
- Credit expiry

Do not scaffold placeholder code for any of the above.

---

## Key Invariants to Enforce

1. **Wallet balance never goes negative.** The `debit()` model method is the single enforcement point — it throws before writing if balance is insufficient.
2. **Every credit movement has a corresponding `CreditTransaction`.** `wallet.credit()` and `wallet.debit()` in the service must always be paired with a transaction write in the same Mongoose session.
3. **`CreditTransaction` records are never updated or deleted.** No update or delete route exists for them. They are append-only.
4. **Cashback is only issued once per connection.** The `respondToConnection` service must check `connection.wasVipGated === true` before issuing cashback — and the connection status check (`status !== 'pending'`) guards against double-processing.
5. **Registration reward is per-registration, not per-event.** A user who cancels and re-registers does NOT receive the reward again (check `confirmedAt` was previously null before rewarding — or simply: reward only fires during `registerForEvent`, not `confirm()`).
6. **Referral reward fires only on the referred user's first confirmed registration.** Count existing confirmed registrations before creating the new one. If count > 0, skip the referral reward even if `referredBy` is present.
7. **`CreditConfig` is a singleton.** The service must never call `CreditConfig.create()`. Always use `findOneAndUpdate` with `{ upsert: true, new: true }`.
8. **Package deactivation is soft.** `isActive = false` — never call `findByIdAndDelete` on a package, because existing transaction records reference it.
