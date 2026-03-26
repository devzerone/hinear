-- Performance Investigation and Optimization Tables
-- Migration: 003_performance_tables.sql
-- Feature: 003-performance-audit

-- Table: performance_metrics
-- Stores individual performance measurements collected from the application
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ms', 's', 'KB', 'MB', 'count', 'percentage')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  route TEXT,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  metadata JSONB,
  CONSTRAINT metrics_value_non_negative CHECK (value >= 0),
  CONSTRAINT metrics_timestamp_not_future CHECK (timestamp <= NOW())
);

-- Indexes for performance_metrics
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp_env ON performance_metrics(name, timestamp, environment);
CREATE INDEX IF NOT EXISTS idx_metrics_route ON performance_metrics(route);

-- Table: performance_bottlenecks
-- Tracks identified performance issues with severity ratings and resolution status
CREATE TABLE IF NOT EXISTS performance_bottlenecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'DATABASE_QUERY', 'LARGE_BUNDLE', 'SLOW_API', 'MEMORY_LEAK',
    'EXCESSIVE_RENDERS', 'NETWORK_REQUESTS', 'SLOW_LCP'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  impact TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('IDENTIFIED', 'IN_PROGRESS', 'RESOLVED')),
  identified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT bottlenecks_target_positive CHECK (target_value > 0),
  CONSTRAINT bottlenecks_resolved_at_status CHECK (
    (status = 'RESOLVED' AND resolved_at IS NOT NULL) OR
    (status != 'RESOLVED' AND resolved_at IS NULL)
  )
);

-- Indexes for performance_bottlenecks
CREATE INDEX IF NOT EXISTS idx_bottlenecks_status ON performance_bottlenecks(status);
CREATE INDEX IF NOT EXISTS idx_bottlenecks_severity ON performance_bottlenecks(severity);
CREATE INDEX IF NOT EXISTS idx_bottlenecks_category ON performance_bottlenecks(category);

-- Table: performance_baselines
-- Defines target performance values and thresholds for different metrics
CREATE TABLE IF NOT EXISTS performance_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  route TEXT,
  target_value NUMERIC NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT baselines_target_positive CHECK (target_value > 0),
  CONSTRAINT baselines_thresholds_ordered CHECK (
    target_value < warning_threshold AND warning_threshold < critical_threshold
  )
);

-- Index for performance_baselines
CREATE INDEX IF NOT EXISTS idx_baselines_metric_name ON performance_baselines(metric_name);

-- Table: optimization_records
-- Documents performance improvements with before/after metrics
CREATE TABLE IF NOT EXISTS optimization_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bottleneck_id UUID NOT NULL REFERENCES performance_bottlenecks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  before_value NUMERIC NOT NULL,
  after_value NUMERIC NOT NULL,
  improvement_percentage NUMERIC NOT NULL,
  implementation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  CONSTRAINT optimizations_improvement CHECK (after_value < before_value),
  CONSTRAINT optimizations_percentage_positive CHECK (improvement_percentage > 0),
  CONSTRAINT optimizations_verified_after_created CHECK (
    verified_at IS NULL OR verified_at >= created_at
  )
);

-- Indexes for optimization_records
CREATE INDEX IF NOT EXISTS idx_optimizations_bottleneck_id ON optimization_records(bottleneck_id);
CREATE INDEX IF NOT EXISTS idx_optimizations_created_at ON optimization_records(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_bottlenecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_records ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read performance metrics
CREATE POLICY "Authenticated users can read metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can write metrics (system process)
CREATE POLICY "Service role can insert metrics"
  ON performance_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: All authenticated users can read bottlenecks
CREATE POLICY "Authenticated users can read bottlenecks"
  ON performance_bottlenecks
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can manage bottlenecks
CREATE POLICY "Service role can manage bottlenecks"
  ON performance_bottlenecks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: All authenticated users can read baselines
CREATE POLICY "Authenticated users can read baselines"
  ON performance_baselines
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can manage baselines
CREATE POLICY "Service role can manage baselines"
  ON performance_baselines
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: All authenticated users can read optimization records
CREATE POLICY "Authenticated users can read optimizations"
  ON optimization_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can write optimization records
CREATE POLICY "Service role can insert optimizations"
  ON optimization_records
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Function to update updated_at timestamp on performance_baselines
CREATE OR REPLACE FUNCTION update_baselines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_baselines_updated_at
  BEFORE UPDATE ON performance_baselines
  FOR EACH ROW
  EXECUTE FUNCTION update_baselines_updated_at();
