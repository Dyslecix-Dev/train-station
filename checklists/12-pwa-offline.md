# Phase 12 — PWA & Offline Support

## Done-State Check

Before starting, verify Phase 6c outputs exist: completing a workout end-to-end works, workout history page renders, `lib/units.ts` exists.

## Context for Claude Code

The boilerplate already has Serwist configured for service worker and PWA support. This phase focuses on making the active workout flow work offline (gyms have bad signal), configuring runtime caching strategies, and ensuring the PWA install experience is polished. We use Serwist (built on Workbox) for the service worker, IndexedDB (via the `idb` library installed in Phase 1) for offline data queuing, and client-side reconnect sync to push data when connectivity returns. Only the workout flow is offline-capable for v1. Nutrition, sleep, and mood require connectivity.

---

## Checklist

### PWA Manifest & Icons

- [ ] Verify `app/manifest.ts` (or `public/manifest.json` / `manifest.webmanifest`) exists with:
  - `name`: full app name — **import from `lib/config.ts`**, do not hardcode
  - `short_name`: short name for home screen — derive from `lib/config.ts`
  - `start_url`: `/dashboard`
  - `display`: `standalone`
  - `background_color` and `theme_color` matching the app theme
  - `icons`: 192×192 and 512×512 PNG icons (maskable + any purpose)
  - `categories`: `["fitness", "health"]`
- [ ] Verify the manifest is linked in the root layout (the boilerplate may handle this via `app/manifest.ts`)
- [ ] Verify `<meta name="theme-color">` is set (supports dark/light via `media` attribute)
- [ ] Add Apple-specific meta tags if missing: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`

### Service Worker (Serwist)

- [ ] Verify Serwist service worker is registered and activates on app load (boilerplate already has `app/sw.ts`)
- [ ] Configure runtime caching strategies in the service worker:
  - **App shell** (HTML pages): `NetworkFirst` with 3-second timeout, fallback to cache
  - **Static assets** (JS, CSS, fonts, images in `_next/static`): `CacheFirst` with 30-day expiration
  - **API routes / server actions**: `NetworkOnly` (don't cache mutations)
  - **Exercise images** (Supabase Storage): `CacheFirst` with 7-day expiration
  - **USDA API calls**: `NetworkFirst` with 1-hour cache (search results change rarely)
- [ ] Verify the offline fallback page exists at `app/~offline/page.tsx` (boilerplate already has this):
  - Friendly message: "You're offline. Your workout data is saved and will sync when you're back online."
  - If an active workout is in progress, show a link to resume it
- [ ] Register the offline fallback in the service worker precache

### Offline Workout Flow

- [ ] Detect connectivity: use `navigator.onLine` + `online`/`offline` event listeners
- [ ] Create `components/connection-provider.tsx` — a `"use client"` context provider (`ConnectionContext`) that wraps the protected layout, exposing `isOnline: boolean`
- [ ] Create `lib/offline-queue.ts` using the `idb` library:
  - IndexedDB database name: `fitness-app-offline`
  - Object store: `pending-actions`
  - Queue entry shape: `{ id: string, action: string, payload: unknown, timestamp: number, synced: boolean }`
  - Functions:
    - `enqueueAction(action: string, payload: unknown): Promise<string>` — adds to queue, returns the entry ID
    - `getPendingActions(): Promise<QueueEntry[]>` — returns all unsynced entries, ordered by timestamp
    - `markSynced(id: string): Promise<void>`
    - `clearSynced(): Promise<void>` — removes all entries where `synced = true`
- [ ] When **offline**, the auto-save in the active workout store should:
  - Call `enqueueAction('saveWorkoutProgress', payload)` instead of the server action
  - Show a "Saved offline" indicator (amber dot/text, distinct from the normal green "Saved")
  - New sets still get `crypto.randomUUID()` IDs — the same IDs will be used when syncing
- [ ] When the user **completes a workout while offline**:
  - Enqueue the complete action: `enqueueAction('completeWorkout', { workoutId, exercises, sets })`
  - Show: "Workout saved locally. It will sync when you're back online."
  - Redirect to dashboard

### Sync Strategy (Client-Side Reconnect)

- [ ] **Do not use the Background Sync API** for v1 (poor iOS support, complex service worker handler)
- [ ] Create `lib/sync-manager.ts` with `syncPendingData()`:
  - Read all unsynced entries from IndexedDB queue via `getPendingActions()`
  - Replay them in timestamp order as direct server action calls
  - Mark each as synced on success; leave failures for the next attempt
  - Return a summary: `{ synced: number, failed: number }`
- [ ] In `components/connection-provider.tsx`, listen for the `online` event and call `syncPendingData()` automatically
- [ ] Show a brief "Back online — syncing..." toast, then "All data synced" on completion (or "Some data failed to sync — will retry" on partial failure)
- [ ] The sync must be **idempotent**: `saveWorkoutProgress` is already upsert-based. The `completeWorkout` action must check `if (workout.status === 'completed') return early` to handle replays safely.

### Online/Offline Indicator

- [ ] Create `components/connection-status.tsx` that reads from `ConnectionContext`
- [ ] Renders a small banner at the top of the screen when offline: "You're offline — workout data is being saved locally"
- [ ] Banner auto-dismisses when back online after the sync completes
- [ ] Include in the protected layout (`app/(protected)/layout.tsx`)

### Installability

- [ ] Verify the app passes PWA installability checks (manifest, service worker, HTTPS)
- [ ] Create `components/install-prompt.tsx`:
  - Listen for the `beforeinstallprompt` event
  - Show a dismissible banner: "Add {appName} to your home screen for the best experience" — import the app name from `lib/config.ts`
  - "Install" button triggers the prompt
  - Persist dismissal in localStorage so it doesn't show again after dismissed
- [ ] Include in the protected layout

### Testing Offline Support

- [ ] Test: start a workout online, go offline (DevTools or airplane mode), log sets, complete workout
- [ ] Test: verify data appears in IndexedDB while offline (`getPendingActions()` returns entries)
- [ ] Test: go back online, verify client-side sync pushes data to server
- [ ] Test: verify the completed workout appears in history after sync
- [ ] Test: offline fallback page renders when navigating to a non-cached page while offline
- [ ] Test: verify the app shell loads from cache on subsequent visits
