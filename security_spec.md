# Security Specification for AI Video Maker Firestore Rules

## 1. Data Invariants
- Users can only read and write their own `/users/{userId}` profile document (`request.auth.uid == userId`).
- Users cannot elevate their own role (`role: 'admin'`) or reset their `trialStatus` to 'eligible' once modified.
- Video requests in `/video_requests/{requestId}` must have `userId == request.auth.uid`.
- Users can list only their own video requests (`resource.data.userId == request.auth.uid`).
- Admin users (`isAdmin()` or existing `/admins/$(request.auth.uid)`) have elevated review, status update, and delivery permissions.
- Document IDs must conform to `isValidId(id)` pattern (`^[a-zA-Z0-9_\-]+$`) and max length 128 chars.
- Unauthenticated access is completely blocked (`request.auth != null` required).
- Budget requests can be submitted by visitors/users, and read/updated by the user who created them or admins.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read User Profile**: Attempt `get` on `/users/victim-uid` without auth token. (Expect: PERMISSION_DENIED)
2. **Unauthenticated List Video Requests**: Attempt `list` on `/video_requests` without auth. (Expect: PERMISSION_DENIED)
3. **Spoof User Profile Creation**: Authenticated user `alice-uid` attempts creating `/users/bob-uid`. (Expect: PERMISSION_DENIED)
4. **Self-Promote to Admin**: Authenticated user attempts writing `role: "admin"` into `/users/alice-uid`. (Expect: PERMISSION_DENIED)
5. **Ghost Field Injection in User**: User attempts to inject `isSuperUser: true` into `/users/{uid}`. (Expect: PERMISSION_DENIED)
6. **Cross-Tenant Video Request Creation**: User `alice-uid` creates a video request with `userId: "bob-uid"`. (Expect: PERMISSION_DENIED)
7. **Cross-Tenant Video Request Read**: User `alice-uid` attempts `get` on `/video_requests/bob-request-id`. (Expect: PERMISSION_DENIED)
8. **Malicious ID Poisoning**: Attempt to create document with 2000-char non-alphanumeric ID. (Expect: PERMISSION_DENIED)
9. **Tamper Video Request Owner**: User attempts to change `userId` during an `update`. (Expect: PERMISSION_DENIED)
10. **Tamper Final Status**: Non-admin user attempts changing `status: "Delivered"` without admin privileges. (Expect: PERMISSION_DENIED)
11. **Inject Giant String**: Attempt writing 500,000 char string in `title`. (Expect: PERMISSION_DENIED)
12. **Unauthorized Admin Collection Write**: Non-admin user attempts adding their own UID to `/admins/{uid}`. (Expect: PERMISSION_DENIED)

## 3. Test Runner
Defined in `firestore.rules.test.ts`.
