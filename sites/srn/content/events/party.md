---
title: "Year-End Party RSVP"
date: 2025-12-30
layout: form
description: "Join us for the SRN Year-End Party! Please RSVP by Dec 31."
l2_encrypt_default: true
---

# Year-End Party RSVP

Welcome! This is a **Web/A Form** demo. You can submit your RSVP without creating an account. Your identity will be verified securely using your device's Passkey (TouchID / FaceID).

### Your Details

**Name**:
<input type="text" id="name" class="weba-input" placeholder="Your Name" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">

**Will you attend?**:
<select id="attendance" class="weba-input" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <option value="yes">Yes, I'll be there! 🍻</option>
  <option value="online">Joining Online 💻</option>
  <option value="no">Sorry, can't make it 😢</option>
</select>

**Message**:
<textarea id="message" class="weba-input" placeholder="Any dietary restrictions or comments?" style="width: 100%; padding: 8px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px;"></textarea>

### Submission

**Host DID**:
<input type="text" id="recipient" class="weba-input" value="did:web:srn.example" style="width: 100%; font-family: monospace; font-size: 0.9em; color: #666; margin-bottom: 10px;">

<div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
  <button id="submit-btn" class="weba-btn" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
    <span>🔒</span> Sign & Submit with Passkey
  </button>
  <div id="status-msg" style="margin-top: 10px; font-size: 0.9rem;"></div>
</div>

<script>
  document.getElementById('submit-btn').addEventListener('click', async () => {
    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('status-msg');
    
    if (!document.getElementById('name').value) {
        alert("Please enter your name.");
        return;
    }
    
    try {
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerText = "🔐 Verifying Passkey...";
      status.innerText = "Requesting biometric authentication...";
      status.style.color = "#666";
      
      const name = document.getElementById('name').value;
      const attendance = document.getElementById('attendance').value;
      const msg = document.getElementById('message').value;
      const recipient = document.getElementById('recipient').value;
      
      const formData = {
        type: "RSVP",
        name,
        attendance,
        message: msg,
        timestamp: new Date().toISOString()
      };
      
      // Submit using Guest DID
      const result = await window.submitFormWithGuestDid(formData, false, recipient);
      
      status.style.color = "green";
      status.innerHTML = `<strong>✓ Sent Successfully!</strong><br>Sender: <code>${result.senderDid}</code>`;
      btn.innerText = "✓ Sent";
      btn.style.background = "#059669";
      
    } catch (e) {
      console.error(e);
      status.style.color = "red";
      status.innerText = "Error: " + e.message;
      btn.disabled = false;
      btn.innerText = "Try Again";
    }
  });
</script>
