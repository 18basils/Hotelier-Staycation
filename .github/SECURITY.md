# Security Policy

The security of the **Hotelier Staycation** platform, user accounts, and infrastructure is of paramount importance. We actively welcome responsible vulnerability disclosures from security researchers and developers.

---

## Supported Versions

Only the latest active major/minor releases receive security updates and vulnerability patches:

| Version | Supported          |
| ------- | ------------------ |
| 3.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0.0 | :x:                |

---

## Reporting a Vulnerability

> [!IMPORTANT]
> **Please do NOT file public GitHub Issues or public pull requests for security vulnerabilities.** Public reports expose sensitive attack vectors before remediation can be deployed.

### Recommended Method: GitHub Private Vulnerability Reporting
This repository has **Private Vulnerability Reporting enabled**:

1. Navigate to the [**Security tab**](https://github.com/18basils/Hotelier-Staycation/security) of this repository.
2. Under "Security overview", click on [**Report a vulnerability**](https://github.com/18basils/Hotelier-Staycation/security/advisories/new).
3. Provide:
   - Detailed description of the vulnerability.
   - Steps to reproduce or proof-of-concept (PoC) payload.
   - Impact assessment (e.g., authentication bypass, data exposure, privilege escalation).
4. Submit the report. You will communicate with the maintainer in a secure, confidential thread.

---

## Response Timeline

- **Initial Response:** Within 48 hours of report submission.
- **Triage & Assessment:** Within 3 business days.
- **Patch & Deployment:** High and critical severity issues will be remediated and deployed live to Firebase within 5 business days, followed by a public advisory acknowledgment.

---

## Scope & Guidelines

- **In Scope:**
  - Authentication bypasses (JWT validation, session tampering).
  - Broken Object Level Authorization (BOLA / IDOR) across `/api/reservations` or `/api/admin`.
  - Content Security Policy (CSP) bypasses and Cross-Site Scripting (XSS).
  - Cloud Firestore security rule leaks or unauthorized direct client writes.
- **Out of Scope:**
  - Automated scanner spam without demonstrable business impact.
  - Social engineering or phishing targeting maintainers.
  - Denial of Service (DoS) attacks against third-party upstream providers (Firebase / Google Cloud).
