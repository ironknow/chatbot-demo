import React from "react";

export interface FlowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  status: "pending" | "active" | "completed" | "error";
  duration?: number;
  data?: any;
  timestamp?: string;
}

export interface FlowDebugData {
  step: string;
  timestamp: string;
  data: any;
  duration?: number;
  error?: string;
}
