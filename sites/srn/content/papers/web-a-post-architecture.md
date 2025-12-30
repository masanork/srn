---
title: "Whitepaper: Web/A Post Architecture — The Exchange of Trust"
layout: article
author: "Sorane Project"
date: 2024-12-31
description: "Definition of roles, DID mapping, and rule-based auto-response mechanisms in Web/A Post, enabling intelligent delegation of data sovereignty."
ai_generated: true
---

## 1. Introduction: Web/A Post as an Intelligent PBX and "Postal Hub"

In the Web/A Folio protocol, **Web/A Post** serves as a "mediator of identity and context."

It functions as an **"Intelligent Private Branch Exchange (PBX)"** connecting an individual's identity to the external network, and an **"Intelligent Postal Hub"** capable of sorting, verifying, and responding to messages based on predefined rules in the owner's absence.

In this model, master data resides exclusively on the **Local** side. Web/A Post is tasked with "context-aware delivery and intelligent front-office operations."

## 2. Defining Roles: Admin, Member, Guest, and Visitor

Access control within the Web/A ecosystem is strictly managed based on the following roles:

- **Admin**: Full authority over the Folio. Owner of the root keys.
- **Member**: Trusted insiders, such as family or organizational members. Authorized to read/write specific folders.
- **Guest**: External parties with temporary access. Uses `did:key` or similar for specific procedures (e.g., filling out a form).
- **Visitor**: **External parties holding a formal DID issued by another Folio / Post.** They possess an autonomous identity authenticated via cross-folio federation.

## 3. DID Mapping and Inter-Folio Networking

To facilitate communication between disparate Folios (**Inter-Folio Networking**), multiple Decentralized Identifier (DID) models are utilized.

### 3.1. Binding did:key to did:web
- **Intra-Folio Communication**: Primarily uses lightweight, disposable `did:key` identifiers.
- **Inter-Organizational Communication**: Utilizes `did:web` for persistent endpoints.

Web/A Post manages the link between these DIDs using **Verifiable Credentials (VCs)**. This mapping is not restricted to a 1:1 relationship; it supports dynamic addressing where multiple `did:key` identifiers can map to a single `did:web` (or vice-versa) based on the context of use.

### 3.2. Responsibility as a Verifiable Data Repository (VDR)
Web/A Post functions as a reliable **Verifiable Data Repository (VDR)** for authority management (DIDs and VCs). While it treats message transport as "best-effort," it is responsible for:
- Management of public key validity.
- Execution and publication of VC Revocations when necessary.
- Maintenance of the chain of trust at the protocol level.

## 4. Rule-Based Auto-Responses: Intelligent Delegation of Sovereignty

A defining feature of Web/A Post is the **"Rule-based Auto-responder,"** which provides automated front-office services alongside traditional message buffers.

### 4.1. Local Control, Remote Execution
Metadata and data ownership remain Local, but users can "push" **delegation rules** to the server (Post)—authorizing it to present specific data under defined conditions.

### 4.2. Key Auto-Response Use Cases
- **Presence and Announcements**: Out-of-office notifications or current availability status.
- **Schedule Visibility**: Presenting available time slots from a calendar while keeping details private.
- **Attribute Presentation**: Responding to frequent inquiries for basic Profile info or verified attributes in an FAQ-like format.
- **Intelligent Routing**: Deciding whether to immediately store an incoming message or request further verification based on the sender's attributes (e.g., whether they are a Member or a Visitor).

## 5. Conclusion: Functional Separation of the Briefcase (Local) and the Postal Hub (Post)

In the Web/A architecture, architectural roles are clearly separated into "Local as Master" and "Relay Infrastructure as an Intelligent Mediator."

If the Local Folio sitting in the user's hand is the **physical "Briefcase,"** then Web/A Post functions as an **autonomous "Intelligent Postal Hub" or a "Digital Counter."**

By combining context-aware delivery, robust identity management (VDR), and intelligent delegation of rule-based responses, users can maintain absolute sovereignty over their data while establishing a truly intelligent and secure digital presence in an interconnected world.
