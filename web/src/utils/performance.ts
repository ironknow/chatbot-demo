import React from "react";

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime === undefined) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);

    if (process.env.NODE_ENV === "development") {
      console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    return fn().finally(() => {
      this.endTiming(label);
    });
  }

  measureSync<T>(label: string, fn: () => T): T {
    this.startTiming(label);
    const result = fn();
    this.endTiming(label);
    return result;
  }
}

// React performance utilities
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
) => {
  return React.memo((props: P) => {
    const monitor = PerformanceMonitor.getInstance();

    React.useEffect(() => {
      monitor.startTiming(`${componentName}-render`);
      return () => {
        monitor.endTiming(`${componentName}-render`);
      };
    });

    return React.createElement(Component, props);
  });
};

// Memory usage monitoring
export const logMemoryUsage = (label: string): void => {
  if (process.env.NODE_ENV === "development" && "memory" in performance) {
    const memory = (performance as any).memory;
    console.log(`${label} Memory Usage:`, {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// Component render count tracking
export const useRenderCount = (componentName: string): number => {
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
};
