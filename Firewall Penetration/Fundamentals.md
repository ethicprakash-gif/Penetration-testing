# Firewall Assessment Fundamentals

Firewall penetration testing evaluates whether a firewall's **rules, segmentation, and
inspection** actually enforce the intended security policy. A firewall is only as good as
its ruleset and the architecture around it.

## What you are really testing

- **Ingress filtering** — what can reach internal services from outside.
- **Egress filtering** — what internal hosts can send *out* (often weak, and key to
  command-and-control and data exfiltration).
- **Segmentation** — whether network zones (DMZ, internal, management) are truly isolated.
- **Inspection** — whether the device decodes and blocks malicious traffic, or just filters
  ports.

## Methodology

1. **Identify the firewall** — fingerprint via banners, TTLs, error behaviour, and
   management interfaces. Note vendor and likely model.
2. **Map the ruleset behaviourally** — scan from multiple source zones to learn which
   ports/protocols are permitted where.
3. **Test segmentation** — from each zone, attempt to reach hosts in others; segmentation
   gaps are common and high-impact.
4. **Test egress** — from an internal foothold, try outbound on common ports (53, 80, 443),
   DNS tunnelling, and unusual protocols to find exfil paths.
5. **Probe inspection/evasion** — fragmentation, unusual flag combinations, and protocol
   tricks to see whether stateful/deep inspection holds.
6. **Review configuration** (when granted access) — the fastest path to findings: overly
   broad `any/any` rules, unused rules, and missing logging.

## Common findings

| Issue | Impact |
| --- | --- |
| Permissive `any → any` rules | Broad lateral movement and exposure |
| Weak or no egress filtering | Easy C2 and data exfiltration |
| Flat network behind the firewall | One foothold reaches everything |
| Management interface exposed | Direct compromise of the control plane |
| Inspection disabled / bypassable | Malicious payloads pass through |

## Starter tooling

- **Scanning / mapping:** `nmap` (incl. `--source-port`, fragmentation, ACL mapping),
  `hping3`, `firewalk`
- **Egress testing:** `dnscat2`, `iodine` (DNS tunnelling), simple outbound port checks
- **Config review:** vendor rule exports, `nipper`-style analysers

Combine behavioural testing with a configuration review whenever possible — together they
reveal both *what the firewall does* and *what it was meant to do*.
