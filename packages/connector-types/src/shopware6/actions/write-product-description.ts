/**
 * Write Product Description Action
 *
 * Updates product descriptions in Shopware 6 using enrichment field values
 */
import { z } from 'zod'

import { transformValue } from '../../transforms'
import type { ActionExecutionResult, ActionInput, ConnectorAction, ConnectorConfig } from '../../types'
import type { TransformType } from '../../validation'
import { createApiClient, updateProduct } from '../api'

/**
 * Field mapping configuration
 */
const FieldMappingSchema = z.object({
  /** The enrichment field ID to read from */
  sourceFieldId: z.string().min(1, 'Source field is required'),
  /** The Shopware product field to write to (e.g., 'description', 'metaDescription', 'keywords') */
  targetField: z.string().min(1, 'Target field is required'),
  /** Transform to apply before writing */
  transform: z.enum(['raw', 'markdownToHtml', 'number', 'boolean']).default('raw'),
})

/**
 * Action configuration schema
 */
const WriteProductDescriptionConfigSchema = z.object({
  /** Product ID field - which enrichment field contains the Shopware product ID */
  productIdField: z.string().min(1, 'Product ID field is required'),
  /** Language ID to write to (optional - uses default if not specified) */
  languageId: z.string().optional(),
  /** Field mappings - which enrichment fields map to which Shopware fields */
  fieldMappings: z.array(FieldMappingSchema).min(1, 'At least one field mapping is required'),
})

export type WriteProductDescriptionConfig = z.infer<typeof WriteProductDescriptionConfigSchema>

/**
 * Execute the write product description action
 */
async function execute(connectorConfig: ConnectorConfig, input: ActionInput): Promise<ActionExecutionResult> {
  const config = WriteProductDescriptionConfigSchema.parse(input.actionConfig)

  // Get product ID from enrichment field
  const productId = input.item.fieldValues[config.productIdField]
  if (!productId || typeof productId !== 'string') {
    return {
      status: 'skipped',
      message: `No product ID found in field "${config.productIdField}"`,
    }
  }

  // Build the update payload from field mappings
  const updateData: Record<string, unknown> = {}

  for (const mapping of config.fieldMappings) {
    const sourceValue = input.item.fieldValues[mapping.sourceFieldId]
    if (sourceValue !== undefined && sourceValue !== null) {
      updateData[mapping.targetField] = transformValue(sourceValue, mapping.transform as TransformType)
    }
  }

  if (Object.keys(updateData).length === 0) {
    return {
      status: 'skipped',
      message: 'No field values to update',
    }
  }

  try {
    // Create API client and update product
    const client = await createApiClient(connectorConfig.baseUrl, {
      clientId: connectorConfig.credentials.clientId,
      clientSecret: connectorConfig.credentials.clientSecret,
    })

    await updateProduct(client, productId, updateData, config.languageId)

    return {
      status: 'success',
      message: `Updated product ${productId}`,
      data: {
        productId,
        updatedFields: Object.keys(updateData),
      },
    }
  } catch (error) {
    return {
      status: 'failed',
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Preview what will be written without executing
 */
async function preview(_connectorConfig: ConnectorConfig, input: ActionInput): Promise<Record<string, unknown>> {
  const config = WriteProductDescriptionConfigSchema.parse(input.actionConfig)

  const productId = input.item.fieldValues[config.productIdField]
  const updateData: Record<string, unknown> = {}

  for (const mapping of config.fieldMappings) {
    const sourceValue = input.item.fieldValues[mapping.sourceFieldId]
    if (sourceValue !== undefined && sourceValue !== null) {
      updateData[mapping.targetField] = transformValue(sourceValue, mapping.transform as TransformType)
    }
  }

  return {
    productId,
    languageId: config.languageId,
    updatePayload: updateData,
  }
}

/**
 * Default configuration for newly created automations
 * Users must configure this before running the automation
 */
const defaultConfig: WriteProductDescriptionConfig = {
  productIdField: '',
  fieldMappings: [],
}

/**
 * Write Product Description action definition
 */
export const writeProductDescriptionAction: ConnectorAction = {
  id: 'writeProductDescription',
  name: 'Write Product Description',
  description: 'Updates product descriptions and metadata in Shopware 6 using enrichment field values',
  configSchema: WriteProductDescriptionConfigSchema,
  defaultConfig,
  configFields: [
    {
      id: 'productIdField',
      name: 'Product ID Field',
      description: 'Select the enrichment field that contains the Shopware product ID',
      type: 'listFieldSelect',
      required: true,
    },
    {
      id: 'fieldMappings',
      name: 'Field Mappings',
      description: 'Map enrichment fields to Shopware product fields',
      type: 'fieldMappings',
      required: true,
      targetFields: [
        { id: 'description', name: 'Description', description: 'Product description (HTML)' },
        { id: 'metaDescription', name: 'Meta Description', description: 'SEO meta description' },
        { id: 'metaTitle', name: 'Meta Title', description: 'SEO meta title' },
        { id: 'keywords', name: 'Keywords', description: 'SEO keywords' },
        { id: 'name', name: 'Product Name', description: 'Product display name' },
        { id: 'customSearchKeywords', name: 'Search Keywords', description: 'Custom search keywords' },
      ],
      transforms: [
        { id: 'raw', name: 'Raw', description: 'No transformation' },
        { id: 'markdownToHtml', name: 'Markdown to HTML', description: 'Convert Markdown to HTML' },
        { id: 'number', name: 'Number', description: 'Convert to number' },
        { id: 'boolean', name: 'Boolean', description: 'Convert to boolean' },
      ],
    },
  ],
  execute,
  preview,
}
