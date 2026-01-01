---
title: "Web/A Post Deployment Strategy & Architecture Comparison"
layout: article
author: "Sorane Project Strategy Team"
description: "Platform selection for Web/A Post implementation. Comparison of Cloudflare, Supabase, Firebase, and local Japanese IaaS, with recommended configurations based on AI affinity, cost, and data sovereignty."
ai_generated: true
date: 2025-12-31
---

# Web/A Post Deployment Strategy & Architecture Comparison

As Web/A Post (Intelligent Postal Hub) is an "agent" to protect individual data sovereignty, it is essential to avoid being completely dependent on (locked into) specific tech giants.
On the other hand, an environment where individuals can enjoy advanced AI functions at low cost (preferably free) is also necessary.

This document compares and examines platforms for the persistence and deployment of Web/A Post and defines the strategy for architectural design.

## 1. Core Architecture Principle: Hexagonal Architecture

To remain independent of any specific cloud, we clearly separate the **"Core Logic (Hub)"** from the **"External Adapters (Storage/Network)."**

- **Core (Domain)**:
    - Rule engine, DID resolution, and permission management.
    - **No dependencies** (Pure TypeScript). Runs anywhere.
- **Ports (Interfaces)**:
    - `IStorage`: Saving envelopes, loading rules.
    - `IIdentity`: DID resolution, signature verification.
- **Adapters (Infrastructure)**:
    - **Cloudflare D1 / KV / R2** (Edge)
    - **Supabase (PostgreSQL / pgvector)** (Serverless)
    - **Firebase Firestore** (mBaaS)
    - **Local FileSystem** (Self-hosted / Docker)

---

## 2. Platform Comparison

### A. Cloudflare (Workers + D1 + R2)
**"The Fast, Cheapest Post Office at the Edge"**

- **Overview**: Executes JavaScript at globally distributed edges.
- **Compatibility with Web/A Post**: **Best Match**.
    - The roles of Post are "routing" and "temporary storage," which perfectly match edge characteristics.
    - Bun / Node compatibility is improving, making migration easier.
- **AI Affinity**: **Workers AI** is available. Inference by Llama, etc., can be executed at the edge at low cost.
- **Cost**:
    - **Free Tier**: Up to 100k requests/day free. Almost free for personal use.
    - **D1 (SQLite)**: Read/write costs are extremely low.
- **Concerns**: Being SQLite-based, complex vector searches require additional configuration like Vectorize.

### B. Supabase (Edge Functions + PostgreSQL)
**"A Powerful Mothership for AI Search and Relational Data"**

- **Overview**: The leading OSS alternative to Firebase. Leverage PostgreSQL to the fullest.
- **Compatibility with Web/A Post**: **Great**.
    - Strong in querying structured data (VC metadata, etc.).
    - **pgvector** is available by default, making it easy to implement AI search functions that "semantically search" by embedding received messages.
- **AI Affinity**: Very high. Vector search is completed at the DB layer.
- **Cost**:
    - **Free Tier**: 500MB database free. Sufficient for personal use.
    - There are instance sleep limits, but edge functions can bypass this, requiring minor adjustments for a Post's constant availability.
- **Concerns**: Edge (Function) startup speed may be slower than Cloudflare.

### C. Firebase (Cloud Functions + Firestore)
**"The Stablest Choice for Rapid Development"**

- **Overview**: mBaaS provided by Google.
- **Compatibility with Web/A Post**: **Good**.
    - The Firestore NoSQL model is friendly for saving JSON documents (VCs).
    - Authentication (Firebase Auth) is strong, but Web/A uses DID auth, so this benefit is minimal.
- **AI Affinity**: Powerful integration like Vertex AI Extensions, but configuration tends to be complex.
- **Cost**:
    - **Free Tier**: The Spark plan (free) exists, but using Cloud Functions (requiring external communication) often demands the Blaze plan (pay-as-you-go). This is the biggest drawback.
- **Concerns**: **Vendor lock-in** is the strongest. Highly dependent on Google's specification changes.

### D. Sakura Internet / Local VPS (Docker)
**"The Final Bastion for Data Sovereignty and Autonomy"**

- **Overview**: Deployed as a container on a virtual server (VPS/IaaS).
- **Compatibility with Web/A Post**: **Essential** from a "sovereignty" perspective.
    - Domestic data centers not influenced by the US Cloud Act can be selected.
    - A configuration of Bun + SQLite can be easily containerized and run.
- **AI Affinity**: Depends on machine power. AI inference is heavy on non-GPU instances (requires external API dependencies).
- **Cost**:
    - **Paid**: Several hundred yen per month. Usually no free tier.
    - However, "fixed cost" provides peace of mind as bills won't skyrocket under attack.

---

## 3. Comprehensive Evaluation Matrix

| Item | **Cloudflare** | **Supabase** | **Firebase** | **Sakura / VPS** |
| :--- | :--- | :--- | :--- | :--- |
| **Arch Fit** | ◎ (Edge Router) | ◯ (Database) | ◯ (Event Driven) | ◯ (Server) |
| **AI (Vector)** | ◯ (Vectorize) | **◎ (pgvector)** | △ (Extensions) | △ (Self-host) |
| **Cost (Personal)** | **◎ (Free)** | ◯ (Free Tier) | △ (PAYG Risk) | △ (Monthly) |
| **Lock-in Avoidance** | ◯ (Web Standards) | ◎ (OSS/Postgres) | × (Proprietary) | **◎ (Docker)** |
| **Data Sovereignty** | △ (Global) | △ (AWS Hosted) | △ (Google) | **◎ (Domestic)** |

## 4. Recommended Configuration & Roadmap

For the prototype and initial operation of Web/A Post, we recommend the following two-stage configuration:

### Phase 1: Cloudflare Workers + D1 + R2
**"Build a Free, Fast Post Office First"**
- **Reason**: Cost performance and ease of deployment. Implementing based on web standard APIs (Fetch, Streams) ensures easy portability.
- **Structure**:
    - **Logic**: Workers (Hono or Native Bun-compatible)
    - **Meta**: D1 (SQLite) - Rules, DID links
    - **Body**: R2 (Object Storage) - Encrypted VC/Blob data

### Phase 2: Supabase (Optional AI Layer)
**"AI-enabled Search for Past Contexts"**
- **Reason**: When messages accumulate, add or migrate to Supabase as a backend if "semantic search" or "RAG (Retrieval-Augmented Generation)" using pgvector is desired.

### Phase 3: Sakura / Self-Hosted (Sovereign Mode)
**"Toward True Decentralized Autonomy"**
- **Reason**: Cases for corporations or governments where legal requirements for data storage location are strict.
- **Structure**: Deploy Docker container (`weba-post:latest`) using internal SQLite or PostgreSQL.

## 5. Implementation Action Plan

1.  Create `src/post/storage/` directory and define abstract interface `IStorage`.
2.  Create `FileSystemStorage` (for Bun) as a reference implementation and complete local development.
3.  Next, create a `CloudflareD1Storage` adapter and build a configuration deployable with Wrangler.

---

**Conclusion**:
Design with **Cloudflare** as the primary target for now, keeping **Supabase** in sight as an expansion hub for AI functions. Ultimately, use **Docker containerization** as a guarantee for portability, enabling a return to "self-hosted servers" whenever necessary.
