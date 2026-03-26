// Alert Manager
// Feature: 003-performance-audit (User Story 3: Monitoring)

/**
 * Alert Manager for performance notifications
 *
 * Manages alert generation, deduplication, and delivery across multiple channels.
 */

import type { BottleneckSeverity } from "../contracts";
import { baselineManager } from "./baseline-manager";
import { bottleneckTracker } from "./bottleneck-tracker";

export interface Alert {
  id: string;
  severity: BottleneckSeverity | "INFO";
  title: string;
  message: string;
  timestamp: Date;
  source: "baseline" | "bottleneck" | "recovery";
  metadata?: Record<string, unknown>;
}

export interface AlertHistoryEntry {
  alert: Alert;
  sent: boolean;
  channels: string[];
  error?: string;
}

/**
 * Alert cooldown periods to prevent spam
 */
const ALERT_COOLDOWNS: Record<BottleneckSeverity | "INFO", number> = {
  CRITICAL: 5 * 60 * 1000, // 5 minutes
  HIGH: 15 * 60 * 1000, // 15 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LOW: 60 * 60 * 1000, // 1 hour
  INFO: 2 * 60 * 60 * 1000, // 2 hours
};

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  maxAlertsPerHour: 10,
  maxCriticalAlertsPerHour: 5,
};

export class AlertManager {
  private alertHistory: Map<string, AlertHistoryEntry[]> = new Map();
  private lastAlertTimes: Map<string, Date> = new Map();
  private hourlyAlertCount: number = 0;
  private hourlyCriticalCount: number = 0;
  private lastHourReset: Date = new Date();

  /**
   * Check for violations and bottlenecks that should trigger alerts
   */
  async checkAlerts(
    metrics: Array<{
      name: string;
      value: number;
      route?: string | null;
    }>
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check baseline violations
    const violations = await baselineManager.checkBaselines(metrics);

    for (const violation of violations) {
      const alertKey = `baseline:${violation.metricName}:${violation.route || "global"}`;

      if (
        this.shouldSendAlert(
          alertKey,
          (violation.thresholdType === "critical" ? "CRITICAL" : "HIGH") as any
        )
      ) {
        alerts.push({
          id: this.generateAlertId(),
          severity: (violation.thresholdType === "critical"
            ? "CRITICAL"
            : "HIGH") as any,
          title: `${violation.metricName} threshold exceeded`,
          message: `Current: ${violation.currentValue}${violation.baseline.unit}, ${violation.thresholdType} threshold: ${violation.thresholdValue}${violation.baseline.unit}`,
          timestamp: new Date(),
          source: "baseline",
          metadata: {
            metricName: violation.metricName,
            route: violation.route,
            currentValue: violation.currentValue,
            thresholdType: violation.thresholdType,
            thresholdValue: violation.thresholdValue,
            targetValue: violation.targetValue,
          },
        });
      }
    }

    // Check for new critical/high bottlenecks
    const activeBottlenecks = await bottleneckTracker.getActiveBottlenecks();
    const criticalBottlenecks = activeBottlenecks.filter(
      (b) => b.severity === "CRITICAL" || b.severity === "HIGH"
    );

    for (const bottleneck of criticalBottlenecks) {
      const alertKey = `bottleneck:${bottleneck.id}`;

      if (this.shouldSendAlert(alertKey, bottleneck.severity)) {
        alerts.push({
          id: this.generateAlertId(),
          severity: bottleneck.severity,
          title: `${bottleneck.category} bottleneck detected`,
          message: `${bottleneck.title}: ${bottleneck.description}`,
          timestamp: new Date(),
          source: "bottleneck",
          metadata: {
            bottleneckId: bottleneck.id,
            category: bottleneck.category,
            currentValue: bottleneck.currentValue,
            targetValue: bottleneck.targetValue,
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Send alert through appropriate channels
   */
  async sendAlert(alert: Alert): Promise<void> {
    const channels = this.getChannelsForSeverity(alert.severity);

    // Update rate limiting counters
    this.updateRateLimits(alert.severity);

    // Send to each channel
    for (const channel of channels) {
      try {
        await this.sendToChannel(alert, channel);

        // Record in history
        this.recordAlert(alert, true, channels);

        console.log(
          `[AlertManager] Sent ${alert.severity} alert to ${channel}: ${alert.title}`
        );
      } catch (error) {
        // Record failure
        this.recordAlert(alert, false, channels, error as Error);

        console.error(
          `[AlertManager] Failed to send alert to ${channel}:`,
          error
        );
      }
    }
  }

  /**
   * Get alert history within time range
   */
  getAlertHistory(timeRange: { start: Date; end: Date }): AlertHistoryEntry[] {
    const history: AlertHistoryEntry[] = [];

    for (const entries of this.alertHistory.values()) {
      for (const entry of entries) {
        if (
          entry.alert.timestamp >= timeRange.start &&
          entry.alert.timestamp <= timeRange.end
        ) {
          history.push(entry);
        }
      }
    }

    // Sort by timestamp (newest first)
    return history.sort(
      (a, b) => b.alert.timestamp.getTime() - a.alert.timestamp.getTime()
    );
  }

  /**
   * Determine which channels to use for a given severity
   */
  private getChannelsForSeverity(
    severity: BottleneckSeverity | "INFO"
  ): string[] {
    switch (severity) {
      case "CRITICAL":
        return ["console", "email", "webhook"];
      case "HIGH":
        return ["console", "email"];
      case "MEDIUM":
      case "LOW":
        return ["console"];
      case "INFO":
        return ["console"];
      default:
        return ["console"];
    }
  }

  /**
   * Check if alert should be sent (cooldown and deduplication)
   */
  private shouldSendAlert(
    alertKey: string,
    severity: BottleneckSeverity | "INFO"
  ): boolean {
    const now = new Date();
    const cooldown = ALERT_COOLDOWNS[severity];

    // Check cooldown
    const lastAlert = this.lastAlertTimes.get(alertKey);
    if (lastAlert) {
      const timeSinceLastAlert = now.getTime() - lastAlert.getTime();
      if (timeSinceLastAlert < cooldown) {
        return false; // Still in cooldown
      }
    }

    // Check rate limits
    if (!this.checkRateLimits(severity)) {
      return false; // Rate limit exceeded
    }

    // Update last alert time
    this.lastAlertTimes.set(alertKey, now);

    return true;
  }

  /**
   * Check rate limits
   */
  private checkRateLimits(severity: BottleneckSeverity | "INFO"): boolean {
    const now = new Date();

    // Reset counters every hour
    if (now.getTime() - this.lastHourReset.getTime() > 60 * 60 * 1000) {
      this.hourlyAlertCount = 0;
      this.hourlyCriticalCount = 0;
      this.lastHourReset = now;
    }

    // Check total alert limit
    if (this.hourlyAlertCount >= RATE_LIMITS.maxAlertsPerHour) {
      console.warn("[AlertManager] Hourly alert limit reached");
      return false;
    }

    // Check critical alert limit
    if (
      (severity === "CRITICAL" || severity === "HIGH") &&
      this.hourlyCriticalCount >= RATE_LIMITS.maxCriticalAlertsPerHour
    ) {
      console.warn("[AlertManager] Hourly critical alert limit reached");
      return false;
    }

    return true;
  }

  /**
   * Update rate limit counters
   */
  private updateRateLimits(severity: BottleneckSeverity | "INFO"): void {
    this.hourlyAlertCount++;

    if (severity === "CRITICAL" || severity === "HIGH") {
      this.hourlyCriticalCount++;
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(alert: Alert, channel: string): Promise<void> {
    const formattedMessage = this.formatAlert(alert, channel);

    switch (channel) {
      case "console":
        console.log(formattedMessage);
        break;

      case "email":
        // Placeholder for email integration
        // In production, this would call an email service API
        console.log(`[EMAIL] ${formattedMessage}`);
        break;

      case "webhook":
        // Placeholder for webhook integration
        // In production, this would send a POST request to a webhook URL
        console.log(`[WEBHOOK] ${formattedMessage}`);
        break;

      default:
        console.warn(`[AlertManager] Unknown channel: ${channel}`);
    }
  }

  /**
   * Format alert for specific channel
   */
  private formatAlert(alert: Alert, channel: string): string {
    const timestamp = alert.timestamp.toISOString();

    switch (channel) {
      case "console":
        return `[${alert.severity}] ${alert.title}\n${alert.message}\n${timestamp}`;

      case "email":
        return `
Subject: [${alert.severity}] ${alert.title}

${alert.message}

Timestamp: ${timestamp}
Severity: ${alert.severity}
Source: ${alert.source}
        `.trim();

      case "webhook":
        return JSON.stringify({
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          timestamp,
          source: alert.source,
          metadata: alert.metadata,
        });

      default:
        return `[${alert.severity}] ${alert.title}: ${alert.message}`;
    }
  }

  /**
   * Record alert in history
   */
  private recordAlert(
    alert: Alert,
    sent: boolean,
    channels: string[],
    error?: Error
  ): void {
    const entry: AlertHistoryEntry = {
      alert,
      sent,
      channels,
      error: error?.message,
    };

    const key = `${alert.source}:${alert.severity}`;
    if (!this.alertHistory.has(key)) {
      this.alertHistory.set(key, []);
    }

    this.alertHistory.get(key)?.push(entry);

    // Keep only last 1000 alerts per key
    const entries = this.alertHistory.get(key);
    if (entries && entries.length > 1000) {
      entries.shift();
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear alert history (for testing)
   */
  clearHistory(): void {
    this.alertHistory.clear();
    this.lastAlertTimes.clear();
    this.hourlyAlertCount = 0;
    this.hourlyCriticalCount = 0;
    this.lastHourReset = new Date();
  }
}

// Export singleton instance
export const alertManager = new AlertManager();
