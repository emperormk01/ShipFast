
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
