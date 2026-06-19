import React from 'react';
import {
  Globe, Webhook, Network, Server, Cloud, Container, Smartphone, MonitorSmartphone,
  Cpu, Wifi, Blocks, Bot, Search, Fish, FileCode2, SlidersHorizontal, GitBranch,
  Workflow, ShieldAlert, Flame, Building2, Fingerprint, ShieldCheck, type LucideIcon,
} from 'lucide-react';

/** Maps a top-level category key to a consistent Lucide icon (one icon family, no emoji). */
const MAP: Record<string, LucideIcon> = {
  'Web Application Pentesting': Globe,
  'API Pentesting': Webhook,
  'Secure Code Review': FileCode2,
  'Mobile Pentesting': Smartphone,
  'Thick Client Pentesting': MonitorSmartphone,
  'Cloud Pentesting': Cloud,
  'Network Pentesting': Network,
  'Firewall Penetration': Flame,
  'Infrastucture Security': Building2,
  'LLM Security Assessment': Bot,
  'MCP Security Assessment': Bot,
  'Active Directory Pentesting': Server,
  'Container & Kubernetes  Assessment': Container,
  'IoT Pentesting': Cpu,
  'Wi-Fi Pentesting': Wifi,
  'BlockChain Pentesting': Blocks,
  'OSINT': Search,
  'Phishing Assessment': Fish,
  'Configuration Review': SlidersHorizontal,
  'DevSecOps': GitBranch,
  'CI-CD Pentesting': Workflow,
  'Threat Modeling': ShieldAlert,
  'Forensic': Fingerprint,
};

export default function CategoryIcon({categoryKey, size = 24}: {categoryKey: string; size?: number}): React.JSX.Element {
  const Icon = MAP[categoryKey] ?? ShieldCheck;
  return <Icon size={size} strokeWidth={1.9} />;
}
