---
title: "Year-End Party RSVP"
date: 2025-12-30
layout: form
description: "Join us for the SRN Year-End Party! Please RSVP by Dec 31."
l2_encrypt_default: true
l2_recipient_kid: "demo-host"
---

# Year-End Party RSVP

Welcome! This is a **Web/A Form** demo. Your identity will be verified securely using your device's Passkey.

### Your Details

- [text:name (context="Your full name for the guest list" property="schema:name" required="true")] Name

- [radio:attendance (value="yes")] Yes, I'll be there! 🍻
- [radio:attendance (value="online")] Joining Online 💻
- [radio:attendance (value="no")] Sorry, can't make it 😢

### Preferences

- [number:guests (min="1" show_if="attendance == 'yes'" context="Number of people including yourself")] Number of Guests
- [text:dietary (show_if="attendance == 'yes'" context="Allergies or restrictions")] Dietary Restrictions

- [textarea:message (context="Message to the host")] Message

---
