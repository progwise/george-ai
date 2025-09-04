import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { dateTimeString, duration, formatDuration, timeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { AiContentProcessingTask_TimelineFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'

graphql(`
  fragment AiContentProcessingTask_Timeline on AiContentProcessingTask {
    createdAt
    processingStartedAt
    processingFinishedAt
    processingFailedAt
    processingTimeout
    extractionStartedAt
    extractionFinishedAt
    extractionFailedAt
    extractionTimeMs
    extractionTimeout
    embeddingStartedAt
    embeddingFinishedAt
    embeddingFailedAt
    embeddingTimeMs
    embeddingTimeout
    embeddingModelName
    extractionSubTasks {
      id
      extractionMethod
      markdownFileName
      startedAt
      finishedAt
      failedAt
    }
  }
`)

interface TaskTimelineProps {
  task: AiContentProcessingTask_TimelineFragment
}

export const TaskTimeline = ({ task }: TaskTimelineProps) => {
  const { language } = useTranslation()

  const timelineData = useMemo(() => {
    const milestones: Array<{
      labels: Record<string, string>
      time?: string | null
      status: string
      success?: boolean | null
      elapsedTime?: number
      subTasks?: Array<{
        name: string
        startedAt?: string | null
        finishedAt?: string | null
        failedAt?: string | null
      }>
    }> = [
      {
        labels: { done: 'Created', doing: 'Creating', todo: 'Create', skipped: 'no Create' },
        time: task.createdAt,
        status: 'done' as const,
        success: true,
      },
      {
        labels: { done: 'Started', doing: 'Starting', todo: 'Start' },
        time: task.processingStartedAt,
        status: task.processingStartedAt ? ('done' as const) : ('todo' as const),
        success: !task.processingStartedAt ? undefined : true,
        elapsedTime: task.processingStartedAt
          ? new Date(task.processingStartedAt).getTime() - new Date(task.createdAt).getTime()
          : undefined,
      },
      {
        labels: { done: 'Validated', doing: 'Validating', todo: 'Validate', skipped: 'no Validate' },
        time: task.extractionStartedAt || task.embeddingStartedAt || task.processingFailedAt,
        status:
          task.extractionStartedAt || task.embeddingStartedAt || task.processingFailedAt
            ? ('done' as const)
            : task.processingStartedAt
              ? ('doing' as const)
              : ('todo' as const),
        success:
          task.processingFailedAt && !task.extractionStartedAt && !task.embeddingStartedAt
            ? false
            : task.extractionStartedAt || task.embeddingStartedAt
              ? true
              : undefined,
        elapsedTime:
          task.processingStartedAt && (task.extractionStartedAt || task.embeddingStartedAt)
            ? new Date((task.extractionStartedAt || task.embeddingStartedAt)!).getTime() -
              new Date(task.processingStartedAt).getTime()
            : undefined,
      },
      {
        labels: { done: 'Extracted', doing: 'Extracting', todo: 'Extract', skipped: 'no Extract' },
        time: task.extractionFinishedAt || task.extractionFailedAt,
        status:
          task.extractionFinishedAt || task.extractionFailedAt
            ? 'done'
            : task.extractionStartedAt
              ? 'doing'
              : task.embeddingStartedAt || task.processingFailedAt || task.processingFinishedAt
                ? ('skipped' as const)
                : 'todo',
        success: task.extractionFailedAt ? false : task.extractionFinishedAt ? true : undefined,
        elapsedTime:
          task.extractionStartedAt && (task.extractionFinishedAt || task.extractionFailedAt)
            ? new Date((task.extractionFinishedAt || task.extractionFailedAt)!).getTime() -
              new Date(task.extractionStartedAt).getTime()
            : undefined,
        subTasks: task.extractionSubTasks.map((subTask) => ({
          name: subTask.extractionMethod,
          startedAt: subTask.startedAt,
          finishedAt: subTask.finishedAt,
          failedAt: subTask.failedAt,
        })),
      },
      {
        labels: { done: 'Embedded', doing: 'Embedding', todo: 'Embed', skipped: 'no Embed' },
        time: task.embeddingFinishedAt || task.embeddingFailedAt,
        status:
          task.embeddingFinishedAt || task.embeddingFailedAt
            ? 'done'
            : task.embeddingStartedAt
              ? 'doing'
              : !(task.processingFailedAt && !task.processingFinishedAt)
                ? ('todo' as const)
                : ('skipped' as const),
        success: task.embeddingFailedAt ? false : task.embeddingFinishedAt ? true : undefined,
        elapsedTime:
          task.embeddingStartedAt && (task.embeddingFinishedAt || task.embeddingFailedAt)
            ? new Date((task.embeddingFinishedAt || task.embeddingFailedAt)!).getTime() -
              new Date(task.embeddingStartedAt).getTime()
            : undefined,
      },
      {
        labels: { done: 'Finished', doing: 'Finishing', todo: 'Finish', skipped: 'no Finish' },
        time: task.processingFinishedAt || task.processingFailedAt,
        status:
          task.processingFinishedAt || task.processingFailedAt
            ? 'done'
            : task.embeddingFinishedAt || task.embeddingFailedAt
              ? ('doing' as const)
              : ('todo' as const),
        success: !(task.processingFinishedAt || task.processingFailedAt) ? undefined : !!task.processingFinishedAt,
      },
    ]
    return milestones
  }, [task])

  return (
    <div className="space-y-2">
      <ul className="timeline">
        {timelineData.map((milestone, index) => (
          <li
            key={milestone.labels[milestone.status]}
            className={twMerge('timeline-item', !milestone.time && milestone.status !== 'doing' && 'opacity-30')}
          >
            {index !== 0 && <hr />}
            <div className={twMerge('timeline-start', milestone.time && 'timeline-box')}>
              {index === 0 ? dateTimeString(milestone.time, language) : timeString(milestone.time, language)}
            </div>
            <div className="timeline-middle">
              <svg
                className={twMerge(
                  'h-3 w-3',
                  milestone.status === 'todo'
                    ? 'text-neutral'
                    : milestone.status === 'doing'
                      ? 'text-info animate-jump animate-infinite animate-duration-[2000ms] animate-delay-0 animate-ease-linear animate-normal'
                      : milestone.status === 'skipped'
                        ? 'text-neutral-300'
                        : milestone.success
                          ? 'text-success'
                          : 'text-error',
                )}
                strokeWidth={2}
                fill="currentColor"
                stroke="black"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="8" />
              </svg>
            </div>
            <div className="timeline-end mx-4 flex flex-col items-center gap-2">
              <div
                className={twMerge(
                  'badge badge-sm font-semibold',
                  milestone.status === 'todo'
                    ? 'badge-neutral'
                    : milestone.status === 'doing'
                      ? 'badge-info animate-duration-[2000ms] animate-pulse'
                      : milestone.status === 'skipped'
                        ? 'badge-ghost text-base-content/50 font-normal italic'
                        : milestone.success
                          ? 'badge-success'
                          : 'badge-error',
                )}
              >
                <div className="">{milestone.labels[milestone.status]}</div>
              </div>
              <div className="text-neutral/50 text-xs italic">{formatDuration(milestone.elapsedTime)}</div>
              <div>
                {milestone.subTasks && milestone.subTasks.length > 0 && (
                  <ul className="menu menu-compact">
                    {milestone.subTasks.map((subTask) => (
                      <li key={subTask.name} className="px-2">
                        <div className="text-base-content/50 flex items-center justify-between">
                          {subTask.startedAt && !subTask.finishedAt && !subTask.failedAt && (
                            <span className="loading loading-infinity loading-xs"></span>
                          )}
                          <span>{duration(subTask.startedAt, subTask.finishedAt || subTask.failedAt)}</span>
                          <span>{subTask.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {index !== timelineData.length - 1 && <hr />}
          </li>
        ))}
      </ul>
    </div>
  )
}
