/**
 * Visual Spec Schema — Zod definitions for all chart/table/KPI types.
 * The LLM returns these specs; the frontend renders them.
 * All validation uses Zod safeParse so bad payloads never crash the UI.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────
export const ValueFormatSchema = z.enum(['number', 'currency_inr', 'percent']);
export const TrendSchema = z.enum(['up', 'down', 'flat']);

export const SeriesSchema = z.object({
  key: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

// ─────────────────────────────────────────────────────────
// Chart specs (bar / line / area)
// ─────────────────────────────────────────────────────────
const BaseChartSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  xKey: z.string(),
  series: z.array(SeriesSchema).min(1),
  data: z.array(z.record(z.unknown())),
  valueFormat: ValueFormatSchema.default('number'),
});

export const BarChartSpecSchema = BaseChartSchema.extend({ type: z.literal('bar_chart') });
export const LineChartSpecSchema = BaseChartSchema.extend({ type: z.literal('line_chart') });
export const AreaChartSpecSchema = BaseChartSchema.extend({ type: z.literal('area_chart') });

// ─────────────────────────────────────────────────────────
// Pie chart
// ─────────────────────────────────────────────────────────
export const PieChartSpecSchema = z.object({
  type: z.literal('pie_chart'),
  title: z.string(),
  description: z.string().optional(),
  data: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      color: z.string().optional(),
    })
  ),
  valueFormat: ValueFormatSchema.default('number'),
});

// ─────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────
export const ColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  dataType: z.enum(['string', 'number', 'currency_inr', 'date', 'badge']).default('string'),
  sortable: z.boolean().optional().default(true),
});

export const TableSpecSchema = z.object({
  type: z.literal('table'),
  title: z.string(),
  columns: z.array(ColumnSchema).min(1),
  rows: z.array(z.record(z.unknown())),
  pageSize: z.number().int().positive().default(10),
});

// ─────────────────────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────────────────────
export const KpiCardSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.string().optional(),
  trend: TrendSchema.optional().default('flat'),
  valueFormat: ValueFormatSchema.optional().default('number'),
});

export const KpiCardsSpecSchema = z.object({
  type: z.literal('kpi_cards'),
  cards: z.array(KpiCardSchema).min(1),
});

// ─────────────────────────────────────────────────────────
// Discriminated union — the main VisualSpec type
// ─────────────────────────────────────────────────────────
export const VisualSpecSchema = z.discriminatedUnion('type', [
  BarChartSpecSchema,
  LineChartSpecSchema,
  AreaChartSpecSchema,
  PieChartSpecSchema,
  TableSpecSchema,
  KpiCardsSpecSchema,
]);

// ─────────────────────────────────────────────────────────
// Full assistant message (text + visuals array)
// ─────────────────────────────────────────────────────────
export const AssistantMessageSchema = z.object({
  text: z.string(),
  visuals: z.array(VisualSpecSchema).default([]),
});

/**
 * Safely parse a raw object into a VisualSpec.
 * Returns { success: true, data } or { success: false, error }
 * Never throws.
 */
export function parseVisualSpec(raw) {
  return VisualSpecSchema.safeParse(raw);
}

