---
title: "Join Secure Folio"
date: 2025-12-30
layout: form
description: "Request access to this Secure Folio instance by submitting your DID."
l2_encrypt_default: true
---

# Request Access

This Folio instance operates in **Secure Mode**. To exchange messages, your DID must be explicitly allowed by the administrator.

Please submit your access request below. You will use a temporary **Guest Passkey** to sign this request securely.

### Applicant Information

**Display Name**:
<input type="text" id="name" class="weba-input" placeholder="e.g. Alice Smith" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">

**Your DID**:
<div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">
  Generate this on your machine using <code>folio init</code> or <code>folio did create</code>.
</div>
<input type="text" id="did" class="weba-input" placeholder="did:key:z..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace;">

**Reason / Introduction**:
<textarea id="reason" class="weba-input" placeholder="e.g. I am a new team member needing read/write access." style="width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px;"></textarea>

### Submission

**Administrator DID (Host)**:
<input type="text" id="recipient" class="weba-input" value="did:web:srn.example" readonly style="width: 100%; background: #f5f5f5; border: none; color: #666; font-family: monospace; font-size: 0.9em; margin-bottom: 10px;">

<div style="margin-top: 1.5rem; padding: 1.5rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
  <p style="margin-top: 0; font-size: 0.9rem; color: #0369a1;">
    <strong>🔒 Security Check:</strong> We will create a temporary Guest ID on this device using your biometric passkey to sign this request.
  </p>
  <button id="submit-btn" class="weba-btn" style="background: #0284c7; color: white; padding: 12px 24px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center;">
    <span>⚡️</span> Sign & Submit Request
  </button>
  <div id="status-msg" style="margin-top: 15px; font-size: 0.9rem; text-align: center; min-height: 1.2em;"></div>
</div>

<script>
  document.getElementById('submit-btn').addEventListener('click', async () => {
    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('status-msg');
    
    // Validation
    const name = document.getElementById('name').value.trim();
    const candidateDid = document.getElementById('did').value.trim();
    const reason = document.getElementById('reason').value.trim();
    
    if (!name || !candidateDid) {
        alert("Please enter your Name and DID.");
        return;
    }
    
    if (!candidateDid.startsWith("did:")) {
        alert("Invalid DID format. It must start with 'did:'.");
        return;
    }
    
    try {
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = "<span>🔐</span> Verifying Passkey...";
      status.innerText = "Please confirm with TouchID / FaceID...";
      status.style.color = "#666";
      
      const recipient = document.getElementById('recipient').value;
      
      const formData = {
        type: "AccountRequest",
        name,
        candidateDid,
        reason,
        timestamp: new Date().toISOString()
      };
      
      // Submit using Guest DID
      const result = await window.submitFormWithGuestDid(formData, false, recipient);
      
      status.style.color = "#059669";
      status.innerHTML = `
        <div style="padding: 10px; background: #dcfce7; border-radius: 6px; border: 1px solid #86efac;">
          <strong>✓ Request Sent!</strong><br>
          <span style="font-size: 0.85em">Reference ID: <code>${result.id}</code></span><br>
          <span style="font-size: 0.85em">Guest Signer: <code>${result.senderDid.substring(0, 20)}...</code></span>
        </div>
        <p style="margin-top:10px; color: #333;">The administrator has been notified. Please wait for approval.</p>
      `;
      btn.innerHTML = "✓ Request Submitted";
      btn.style.background = "#059669";
      
    } catch (e) {
      console.error(e);
      status.style.color = "#dc2626";
      status.innerText = "Error: " + e.message;
      btn.disabled = false;
      btn.innerHTML = "<span>⚠️</span> Try Again";
    }
  });
</script>
