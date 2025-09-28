SELECT
	"field"."id" as "fieldId",
	"field"."listId" as "listId",
	"field"."name" as "fieldName",
	-- Total items (files) in the list from all sources
	COUNT(DISTINCT "file"."id") as "itemCount",
	-- Items that have any cache entry for this field
	COUNT(DISTINCT CASE
		WHEN "cache"."id" IS NOT NULL THEN "file"."id"
		ELSE NULL
	END) as "cacheCount",
	-- Items with valid values (not null and no error)
	COUNT(DISTINCT CASE
		WHEN "cache"."enrichmentErrorMessage" IS NULL
		AND ("cache"."valueString" IS NOT NULL
			OR "cache"."valueNumber" IS NOT NULL
			OR "cache"."valueDate" IS NOT NULL
			OR "cache"."valueBoolean" IS NOT NULL)
		THEN "file"."id"
		ELSE NULL
	END) as "valuesCount",
	-- Completed tasks (successfully, no error)
	COUNT(DISTINCT CASE
		WHEN "task"."completedAt" IS NOT NULL
		AND "task"."error" IS NULL
		THEN "task"."id"
		ELSE NULL
	END) as "completedTasksCount",
	-- Failed tasks (have error)
	COUNT(DISTINCT CASE
		WHEN "task"."error" IS NOT NULL
		THEN "task"."id"
		ELSE NULL
	END) as "failedTasksCount",
	-- Pending tasks (not started)
	COUNT(DISTINCT CASE
		WHEN "task"."startedAt" IS NULL
		AND "task"."completedAt" IS NULL
		THEN "task"."id"
		ELSE NULL
	END) as "pendingTasksCount",
	-- Processing tasks (started but not completed)
	COUNT(DISTINCT CASE
		WHEN "task"."startedAt" IS NOT NULL
		AND "task"."completedAt" IS NULL
		THEN "task"."id"
		ELSE NULL
	END) as "processingTasksCount"
FROM
	"AiList" as "list"
	INNER JOIN "AiListField" as "field" ON "field"."listId" = "list"."id"
	LEFT JOIN "AiListSource" as "source" ON "source"."listId" = "list"."id"
	LEFT JOIN "AiLibraryFile" as "file" ON "file"."libraryId" = "source"."libraryId"
		AND "file"."archivedAt" IS NULL
	LEFT JOIN "AiListItemCache" as "cache" ON "cache"."fieldId" = "field"."id"
		AND "cache"."fileId" = "file"."id"
	LEFT JOIN "AiEnrichmentTask" as "task" ON "task"."fieldId" = "field"."id"
		AND "task"."fileId" = "file"."id"
WHERE
	"list"."id" = $1
GROUP BY
	"field"."id", "field"."listId", "field"."name"
ORDER BY
	"field"."order" ASC