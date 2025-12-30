# Guest DID Implementation Plan

## Overview
Implement Passkey-based Guest DID for users without permanent DIDs who want to receive replies.

## UX Goals
- **No extra dialogs**: Only OS/browser standard Passkey prompts
- **Seamless flow**: Single checkbox for "Receive replies"
- **No user type selection**: Automatic Guest DID creation

## Architecture

### 1. Firebase Functions API

#### New Mutations
```graphql
type Mutation {
  createGuestDid(credentialId: String!, publicKeyJwk: String!): GuestDid!
}

type GuestDid {
  did: ID!
  expiresAt: String!
}
```

#### Implementation
- Generate `did:web:srn.example:guest:<random-id>`
- Store in Firestore: `guest-dids/<id>`
- Create DID Document with Passkey public key
- Set expiration (30 days default)

### 2. Browser Integration (Maker)

#### Form Submission Flow
```javascript
// In form submission handler
if (wantsReplies) {
  const guestDid = await createGuestDidWithPasskey();
  senderDid = guestDid;
} else {
  senderDid = "did:web:srn.example:forms:contact";
}
```

#### Passkey Creation
```javascript
async function createGuestDidWithPasskey() {
  // 1. Create Passkey
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: await fetchChallenge(),
      rp: { name: "SRN" },
      user: { 
        id: crypto.randomUUID(), 
        name: "guest", 
        displayName: "Guest" 
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: { userVerification: "required" }
    }
  });

  // 2. Call createGuestDid mutation
  const { guestDid } = await graphqlMutation({
    mutation: CREATE_GUEST_DID,
    variables: {
      credentialId: credential.id,
      publicKeyJwk: exportPublicKey(credential.response.getPublicKey())
    }
  });

  return guestDid;
}
```

### 3. Reply Checking UI

#### Simple Status Page
- URL: `/guest-replies?did=<guest-did>`
- Passkey authentication required
- Display inbox messages
- No complex UI needed

## Data Model

### Firestore: `guest-dids/<id>`
```json
{
  "did": "did:web:srn.example:guest:abc123",
  "credentialId": "...",
  "publicKeyJwk": {...},
  "createdAt": "2025-12-30T10:00:00Z",
  "expiresAt": "2026-01-30T10:00:00Z"
}
```

### DID Document (served at `/.well-known/did/guest/<id>/did.json`)
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:web:srn.example:guest:abc123",
  "verificationMethod": [{
    "id": "#passkey",
    "type": "JsonWebKey2020",
    "controller": "did:web:srn.example:guest:abc123",
    "publicKeyJwk": {...}
  }],
  "authentication": ["#passkey"],
  "service": [{
    "type": "FolioInbox",
    "serviceEndpoint": "https://srn.example/api/guest-inbox/abc123"
  }],
  "expiresAt": "2026-01-30T10:00:00Z"
}
```

## Implementation Steps

1. ✅ Specification documented
2. ⏳ Firebase Functions:
   - `createGuestDid` mutation
   - DID Document serving endpoint
   - Guest inbox query with Passkey auth
3. ⏳ Browser (Maker):
   - Passkey integration
   - Form submission with Guest DID
4. ⏳ Reply checking UI:
   - Simple status page
   - Passkey authentication

## Security Considerations

- ✅ Passkey signature verification
- ✅ Expiration enforcement
- ✅ Rate limiting (TODO)
- ✅ Automatic cleanup of expired DIDs (TODO: cron job)

## Testing Plan

1. Create Guest DID via Passkey
2. Submit form with Guest DID
3. Verify message in Firestore
4. Authenticate with Passkey to check replies
5. Test expiration handling
