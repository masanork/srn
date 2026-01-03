# Agent Roles & Responsibilities

## Active Agents
The following specialized sub-agents are available via `delegate_to_agent`:

- **codebase_investigator**:
    - **Role**: Codebase analysis, architectural mapping, dependency tracking.
    - **Trigger**: Vague requests, bug root-cause analysis, refactoring planning.
    - **Output**: Structured report with key file paths and actionable insights.

## Simulated Roles (Governance Simulation)
This project employs "Simulated Governance" to test quality assurance and decision-making processes. Agents may be asked to assume or interact with these roles:

- **Red Team (Security/Architectural Reviewers)**:
    - **Role**: Adversarial review, security audit, identifying architectural risks.
    - **Engagement**: Proactively seek feedback before finalizing critical specs.
- **Security & Legal Task Force (SLTF)**:
    - **Role**: Reviewing alignment between technical verifiability and legal validity.
    - **Trigger**: Critical architectural changes and public-facing specifications.
- **Governance Committee**:
    - **Role**: High-level decision making on project direction and scope changes.
