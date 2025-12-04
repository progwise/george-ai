WITH TaskStats AS (
  SELECT
    "fieldId",
    "itemId",
    BOOL_OR("completedAt" IS NOT NULL AND "error" IS NULL) as has_completed,
    BOOL_OR("error" IS NOT NULL) as has_error,
    BOOL_OR("startedAt" IS NULL AND "completedAt" IS NULL) as has_pending,
    BOOL_OR("startedAt" IS NOT NULL AND "completedAt" IS NULL) as has_processing
  FROM "AiEnrichmentTask"
  WHERE "fieldId" IN (SELECT "id" FROM "AiListField" WHERE "listId" = $1 AND "sourceType" = 'llm_computed')
  GROUP BY "fieldId", "itemId"
),
CacheStats AS (
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
    ) as has_failed
  FROM "AiListItemCache"
  WHERE "fieldId" IN (SELECT "id" FROM "AiListField" WHERE "listId" = $1)
  GROUP BY "fieldId", "itemId"
)
SELECT
  "field"."id" as "fieldId",
  "field"."listId" as "listId",
  "field"."name" as "fieldName",
  COUNT(DISTINCT "item"."id") as "itemCount",
  COUNT(DISTINCT CASE WHEN "cache".has_cache THEN "item"."id" END) as "cacheCount",
  COUNT(DISTINCT CASE WHEN "cache".has_value THEN "item"."id" END) as "valuesCount",
  COUNT(DISTINCT CASE WHEN "task".has_completed THEN "item"."id" END) as "completedTasksCount",
  COUNT(DISTINCT CASE WHEN "task".has_error THEN "item"."id" END) as "errorTasksCount",
  COUNT(DISTINCT CASE WHEN "cache".has_failed THEN "item"."id" END) as "failedTasksCount",
  COUNT(DISTINCT CASE WHEN "task".has_pending THEN "item"."id" END) as "pendingTasksCount",
  COUNT(DISTINCT CASE WHEN "task".has_processing THEN "item"."id" END) as "processingTasksCount"
FROM "AiList" as "list"
INNER JOIN "AiListField" as "field" ON "field"."listId" = "list"."id" AND "field"."sourceType" = 'llm_computed'
LEFT JOIN "AiListItem" as "item" ON "item"."listId" = "list"."id"
LEFT JOIN CacheStats as "cache" ON "cache"."fieldId" = "field"."id"
  AND "cache"."itemId" = "item"."id"
LEFT JOIN TaskStats as "task" ON "task"."fieldId" = "field"."id"
  AND "task"."itemId" = "item"."id"
WHERE "list"."id" = $1
GROUP BY "field"."id", "field"."listId", "field"."name"
ORDER BY "field"."name" ASC
