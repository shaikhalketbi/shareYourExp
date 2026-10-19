# CyberSafe Stories | قصص الأمن السيبراني

A bilingual English/Arabic front-end prototype for an internal employee cybersecurity awareness board.

## Run locally
1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. Use **Share your experience** to add a story.
4. Toggle Arabic/English using the button in the header.

## Important limitation
This prototype stores user-submitted stories in the current browser's `localStorage`. Stories are not transmitted to an IT department and are not visible to other employees or devices. The example cards are demo content.

For organization-wide internal use, have the IT/security team deploy an approved internal application with:
- Organization-approved hosting and network access controls
- Employee authentication and role-based access
- Server-side database storage and backups
- Moderation/approval before stories become visible
- Audit logging, retention/deletion rules, and incident escalation workflow
- Security review, input validation, and protection against common web vulnerabilities

Do not put real confidential information in this prototype. The sensitive-information check is only a basic client-side guard, not a security control.
