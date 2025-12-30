# Guest DID UX Improvements

## Problem
- Every demo creates a new Passkey
- Users accumulate multiple duplicate credentials
- Confusing UX with repeated Passkey prompts

## Solution

### 1. Discoverable Credentials (Resident Keys)
```javascript
authenticatorSelection: {
  residentKey: "required",
  requireResidentKey: true
}
```

**Benefits:**
- Passkeys are stored on the device
- Can be discovered and reused
- User can select from existing credentials

### 2. Automatic Reuse
```javascript
async function getOrCreateGuestDid(forceNew = false) {
  // Check localStorage for existing Guest DID
  const existingDid = await checkExistingGuestDid();
  if (existingDid) {
    return existingDid; // Reuse!
  }
  // Create new only if needed
  return await createGuestDidWithPasskey();
}
```

**Benefits:**
- No duplicate Passkeys
- Seamless experience for returning users
- Explicit control with `forceNew` parameter

### 3. User Feedback
```javascript
if (existingDid) {
  console.log("✓ Using your existing Guest identity");
} else {
  console.log("✓ Created new Guest identity for receiving replies");
}
```

**Benefits:**
- Users understand what's happening
- Clear distinction between new and reused
- Better trust and transparency

## Implementation Details

### Storage Strategy
- **Key:** `guest-did:<did>`
- **Value:** `credentialId`
- **Location:** `localStorage`

### Credential Configuration
```javascript
{
  authenticatorAttachment: "platform",  // Prefer built-in authenticator
  userVerification: "required",         // Biometric/PIN required
  residentKey: "required",              // Make discoverable
  requireResidentKey: true              // Enforce resident key
}
```

### User Identity
```javascript
user: {
  id: crypto.randomUUID(),           // Unique per credential
  name: "guest@srn.example",         // Consistent name
  displayName: "SRN Guest User"      // User-friendly display
}
```

## Testing

### Test Scenario 1: First Time User
1. Check "Receive replies"
2. Submit form
3. **Expected:** Passkey prompt, new Guest DID created
4. **Result:** `🆕 Created new Guest DID with Passkey`

### Test Scenario 2: Returning User
1. Check "Receive replies"
2. Submit form again
3. **Expected:** No Passkey prompt, reuses existing DID
4. **Result:** `♻️ Reused existing Guest DID (no new Passkey created!)`

### Test Scenario 3: Anonymous Submission
1. Uncheck "Receive replies"
2. Submit form
3. **Expected:** No Passkey, uses form DID
4. **Result:** `Anonymous submission (form DID)`

## API Compatibility

### No Breaking Changes
The improved UX is **fully backward compatible**:
- Same GraphQL API (`createGuestDid`)
- Same DID format (`did:web:srn.example:guest:<id>`)
- Same Firestore structure

### Migration Path
Existing implementations can upgrade by:
1. Replace `createGuestDidWithPasskey()` with `getOrCreateGuestDid()`
2. No server-side changes required
3. Existing Guest DIDs continue to work

## Future Enhancements

### 1. Conditional UI (WebAuthn Level 3)
```javascript
<input type="text" autocomplete="webauthn">
```
- Automatic Passkey suggestions in form fields
- No explicit checkbox needed
- Even more seamless

### 2. Cross-Device Sync
- Use Passkey sync (iCloud Keychain, Google Password Manager)
- Same Guest DID across devices
- Better user experience

### 3. DID Rotation
- Automatic renewal before expiration
- Seamless transition to new DID
- No user intervention needed

## Deployment Checklist

- [x] Update `guest-did.js` with reuse logic
- [x] Add discoverable credential configuration
- [x] Implement localStorage checking
- [x] Add user feedback messages
- [x] Create improved test page
- [ ] Integrate with Maker
- [ ] Add analytics for reuse rate
- [ ] Document for end users
