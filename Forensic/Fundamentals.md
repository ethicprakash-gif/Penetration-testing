# Digital Forensics Fundamentals

Digital forensics (DFIR) is the practice of **acquiring, preserving, and analysing**
digital evidence in a way that is accurate and defensible. Whether you are responding to
an incident or supporting an investigation, the same core principles apply.

## Core principles

- **Preserve first, analyse later.** Work on copies, never the original evidence.
- **Maintain integrity.** Hash evidence (e.g. SHA-256) at acquisition and verify it has
  not changed before and after analysis.
- **Document everything.** Who did what, when, and with which tool, the **chain of
  custody** is as important as the findings.

## Order of volatility

When collecting evidence, capture the most volatile data first, because it disappears
soonest:

1. CPU registers and cache
2. RAM (running processes, network connections, encryption keys)
3. Network state (active connections, ARP cache, routing tables)
4. Running system / temporary files
5. Disk
6. Logs and archival media

## The DFIR workflow

| Phase | Goal |
| --- | --- |
| **Identification** | Determine what happened and what may hold evidence |
| **Acquisition** | Create verified forensic images (disk, memory) |
| **Preservation** | Protect integrity; record hashes and custody |
| **Analysis** | Examine timelines, artefacts, and indicators of compromise |
| **Reporting** | Present findings clearly, with evidence and methodology |

## Common artefacts by platform

- **Windows:** Event logs, registry hives, `$MFT`, prefetch, shimcache, amcache.
- **Linux:** `/var/log`, bash history, cron, systemd journals, `/etc` configs.
- **Mobile:** App databases (SQLite), keychains, backups, location history.
- **Memory:** Process lists, injected code, network sockets, credentials.

## Starter tooling

- **Imaging:** `dd`, FTK Imager, Guymager
- **Memory:** Volatility, MemProcFS
- **Disk/triage:** Autopsy / The Sleuth Kit, plaso/log2timeline
- **Hashing:** `sha256sum`, `md5sum`

See the platform-specific guides (**Windows**, **Mobile**) in this section for deeper
walkthroughs.
