WITH CacheStats AS (
  SELECT
    "fieldId",
    "itemId",
    BOOL_OR("id" IS NOT NULL) as has_cache,
    BOOL_OR(
      "enrichmentErrorMessage" IS NULL
      AND ("valueString" IS NOT NULL
        OR "valueNumber" IS NOT NULL
        OR "valueDate" IS NOT NULL
        OR "valueBoolean" IS NOT NULL)
    ) as has_value,
    BOOL_OR(
      "failedEnrichmentValue" IS NOT NULL
    ) as has_missing
  FROM "AiListItemCache"
  WHERE "fieldId" IN (SELECT "id" FROM "AiListField" WHERE "listId" = $1)
  GROUP BY "fieldId", "itemId"
),
TaskCounts AS (
  SELECT
    "fieldId",
    COUNT(*) as total_count,
    COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END) as completed_count,
    COUNT(CASE WHEN "error" IS NOT NULL THEN 1 END) as error_count,
    COUNT(CASE WHEN "startedAt" IS NULL THEN 1 END) as pending_count,
    COUNT(CASE WHEN "startedAt" IS NOT NULL AND "completedAt" IS NULL THEN 1 END) as processing_count,
    AVG(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as processing_duration_seconds
  FROM "AiEnrichmentTask"
  WHERE "fieldId" IN (SELECT "id" FROM "AiListField" WHERE "listId" = $1)
  GROUP BY "fieldId"
)
SELECT
  "field"."id" as "fieldId",
  "field"."listId" as "listId",
  "field"."name" as "fieldName",
  COUNT(DISTINCT "item"."id") as "itemCount",
  COUNT(DISTINCT CASE WHEN "cache".has_cache THEN "item"."id" END) as "cacheCount",
  COUNT(DISTINCT CASE WHEN "cache".has_value THEN "item"."id" END) as "valuesCount",
  COUNT(DISTINCT CASE WHEN "cache".has_missing THEN "item"."id" END) as "missingCount",
  COALESCE(MAX("tasks".total_count), 0) as "totalTasksCount",
  COALESCE(MAX("tasks".completed_count), 0) as "completedTasksCount",
  COALESCE(MAX("tasks".error_count), 0) as "errorTasksCount",
  COALESCE(MAX("tasks".pending_count), 0) as "pendingTasksCount",
  COALESCE(MAX("tasks".processing_count), 0) as "processingTasksCount",
  COALESCE(MAX("tasks".processing_duration_seconds), 0) as "averageProcessingDurationSeconds"
FROM "AiList" as "list"
INNER JOIN "AiListField" as "field" ON "field"."listId" = "list"."id" AND "field"."sourceType" = 'llm_computed'
LEFT JOIN "AiListItem" as "item" ON "item"."listId" = "list"."id"
LEFT JOIN CacheStats as "cache" ON "cache"."fieldId" = "field"."id"
  AND "cache"."itemId" = "item"."id"
LEFT JOIN TaskCounts as "tasks" ON "tasks"."fieldId" = "field"."id"
WHERE "list"."id" = $1
GROUP BY "field"."id", "field"."listId", "field"."name"
ORDER BY "field"."name" ASC
