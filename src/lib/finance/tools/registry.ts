import { getSpendSummary } from './getSpendSummary';
import { getCostCenterDetail } from './getCostCenterDetail';
import { getBudgetStatus } from './getBudgetStatus';
import { listInvoices } from './listInvoices';
import { getRouteMix } from './getRouteMix';
import { forecastRunway } from './forecastRunway';

export interface JsonSchemaProperty {
  type: 'string' | 'integer';
  description: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
}

export interface JsonSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
  additionalProperties: false;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

const ISO_DATE_DESC = 'ISO calendar date in the form YYYY-MM-DD.';
const COST_CENTER_DESC =
  'Optional cost center id such as cc-eng-platform. Omit to cover all cost centers.';

export const FINANCE_TOOLS: ToolDefinition[] = [
  {
    name: 'get_spend_summary',
    description:
      'Return total spend plus breakdowns by cost center and by route for an ISO date range. Use for aggregate spend questions. Do not use for per-invoice questions (use list_invoices) or for forward-looking questions (use forecast_runway). Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: ISO_DATE_DESC },
        to: { type: 'string', description: ISO_DATE_DESC },
        costCenter: { type: 'string', description: COST_CENTER_DESC },
      },
      required: ['from', 'to'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_cost_center_detail',
    description:
      'Return the daily spend series, top models and cap utilisation for one cost center over an ISO date range. Use when the user names a specific cost center. Do not use for cross-cost-center comparisons (use get_spend_summary). Spend is aggregated per cost center, never per individual. Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        costCenter: { type: 'string', description: 'Cost center id such as cc-eng-platform.' },
        from: { type: 'string', description: ISO_DATE_DESC },
        to: { type: 'string', description: ISO_DATE_DESC },
      },
      required: ['costCenter', 'from', 'to'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_budget_status',
    description:
      'Return cap, spend, remaining budget, circuit breaker state and reroute count per cost center. Use for budget headroom and breaker questions. Do not use for historical spend trends (use get_spend_summary). Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        costCenter: { type: 'string', description: COST_CENTER_DESC },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'list_invoices',
    description:
      'List invoices with net, USt and gross amounts, due dates and an overdue flag. Use for payable and vendor questions. Do not use for model spend (use get_spend_summary). Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Optional invoice status filter.', enum: ['paid', 'open', 'overdue'] },
        vendor: { type: 'string', description: 'Optional exact vendor name filter.' },
        from: { type: 'string', description: `${ISO_DATE_DESC} Must be supplied together with to.` },
        to: { type: 'string', description: `${ISO_DATE_DESC} Must be supplied together with from.` },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'get_route_mix',
    description:
      'Return tokens and cost per routing tier (local versus frontier) and the frontier cost delta for an ISO date range. Use for routing efficiency questions. Do not use for budget caps (use get_budget_status). Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: ISO_DATE_DESC },
        to: { type: 'string', description: ISO_DATE_DESC },
      },
      required: ['from', 'to'],
      additionalProperties: false,
    },
  },
  {
    name: 'forecast_runway',
    description:
      'Project future spend for 1 to 24 months using a straight-line method and return a confidence note. Use for forward-looking runway questions. Do not use for actual historical spend (use get_spend_summary). Data is a fixture; always tell the user the figures are fixture data.',
    inputSchema: {
      type: 'object',
      properties: {
        months: { type: 'integer', description: 'Number of months to project, 1 to 24 inclusive.', minimum: 1, maximum: 24 },
      },
      required: ['months'],
      additionalProperties: false,
    },
  },
];

export const FINANCE_TOOL_NAMES = FINANCE_TOOLS.map((t) => t.name);

export { getSpendSummary, getCostCenterDetail, getBudgetStatus, listInvoices, getRouteMix, forecastRunway };
