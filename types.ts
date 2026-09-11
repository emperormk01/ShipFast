
import React from 'react';

export interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface APIRoute {
  path: string;
  method: string;
  description: string;
}

export interface FileSystem {
  [path: string]: string;
}

export interface PlanPhase {
  title: string;
  goal: string;
  prompt: string;
  files: { path: string; purpose: string }[];
  acceptance: string[];
}

export interface DataEntity {
  entity: string;
  fields: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
}

export interface PlanSkill {
  name: string;
  reason: string;
}

// Architecture plan handed to a coding agent. Stored in the DB `scaffold`
// column (column name kept, no migration needed).
export interface PlannerResponse {
  projectName: string;
  overview: string;
  stack: string;
  phases: PlanPhase[];
  dataModel: DataEntity[];
  apiContract: ApiEndpoint[];
  elements: string[];
  skills: PlanSkill[];
  risks: string[];
  launchChecklist: string[];
}

export interface GitHubSkill {
  repo: string;
  description: string;
  stars: number;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  stack: string;
  status: 'draft' | 'planned' | 'exported';
  lastDeployed: string | null;
  scaffold?: PlannerResponse;
}

export interface BuildLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}
