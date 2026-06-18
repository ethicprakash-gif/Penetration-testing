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
  'Network Pentesting': Network,
  'Active Directory Pentesting': Server,
  'Cloud Pentesting': Cloud,
  'Container & Kubernetes  Assessment': Container,
  'Mobile Pentesting': Smartphone,
  'Thick Client Pentesting': MonitorSmartphone,
  'IoT Pentesting': Cpu,
  'Wi-Fi Pentesting': Wifi,
  'BlockChain Pentesting': Blocks,
  'LLM Security Assessment': Bot,
  'MCP Security Assessment': Bot,
  'OSINT': Search,
  'Phishing Assessment': Fish,
  'Secure Code Review': FileCode2,
  'Configuration Review': SlidersHorizontal,
  'DevSecOps': GitBranch,
  'CI-CD Pentesting': Workflow,
  'Threat Modeling': ShieldAlert,
  'Firewall Penetration': Flame,
  'Infrastucture Security': Building2,
  'Forensic': Fingerprint,
};

export default function CategoryIcon({categoryKey, size = 24}: {categoryKey: string; size?: number}): React.JSX.Element {
  const Icon = MAP[categoryKey] ?? ShieldCheck;
  return <Icon size={size} strokeWidth={1.9} />;
}
