
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

export interface ScaffolderResponse {
  projectName: string;
  databaseSchema: string;
  apiRoutes: APIRoute[];
  recommendedComponents: string[];
  deploymentSteps: string[];
}

export interface Project {
  id: string;
  name: string;
  stack: string;
  status: 'idle' | 'deploying' | 'live' | 'failed';
  lastDeployed: string | null;
  scaffold?: ScaffolderResponse;
}

export interface BuildLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}
