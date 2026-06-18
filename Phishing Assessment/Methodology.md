# Phishing Assessment Methodology

A phishing assessment measures how an organisation's **people, processes, and technical
controls** stand up to social-engineering attacks. The goal is to improve resilience —
not to embarrass employees — so scope, consent, and care matter at every step.

## Rules of engagement

- **Explicit written authorization** is mandatory, including approved targets, timing, and
  pretext boundaries.
- Agree what is **out of scope** (e.g. credential capture vs. just click tracking, home
  contact details, sensitive departments).
- Handle any captured data securely and delete it after reporting.
- Coordinate with the blue team / IT so a real incident is not confused with the test.

## Assessment phases

1. **Reconnaissance (OSINT)** — identify the organisation's email format, public employees,
   technologies, and themes that make a believable pretext.
2. **Pretext design** — craft a scenario aligned to the test goal (credential harvest,
   attachment execution, MFA fatigue, etc.). Keep it realistic and ethical.
3. **Infrastructure setup** — register a look-alike domain, configure mail authentication
   (SPF/DKIM/DMARC) to maximise deliverability, and stand up a landing page / payload host.
4. **Delivery** — send in controlled waves; monitor deliverability and avoid tipping off
   filters too early.
5. **Tracking** — measure opens, clicks, data entry, and reporting rates.
6. **Reporting** — present metrics, the kill chain, and concrete remediation.

## Metrics that matter

| Metric | Why it matters |
| --- | --- |
| Click rate | Initial susceptibility |
| Credential-submit rate | Depth of compromise if real |
| Report rate | Strength of the human detection layer |
| Time-to-report | How quickly defenders would react |

## Defensive recommendations to validate

- Enforced **MFA** (ideally phishing-resistant, e.g. FIDO2) to blunt credential theft.
- Strong **email authentication** (SPF, DKIM, DMARC with enforcement).
- Easy, visible **"report phishing"** workflow for employees.
- Regular, supportive **security awareness training** — measured, not punitive.

## Starter tooling

- **Frameworks:** GoPhish, Evilginx (MFA-relay testing), King Phisher
- **Recon:** theHarvester, Hunter.io, LinkedIn OSINT
- **Infra:** look-alike domains, mail-auth checkers, TLS certificates

Phishing assessments are powerful but sensitive — always prioritise consent, proportionality,
and the dignity of the people being tested.
