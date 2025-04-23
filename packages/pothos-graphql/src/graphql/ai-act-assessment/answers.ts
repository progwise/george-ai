import { AiActQuestion } from '@george-ai/ai-act'

import { prisma } from '../../prisma'

export const getQuestionsWithAnswers = async (assistantId: string, questions: AiActQuestion[]) => {
  const answers = await prisma.aiAssistantEUActAnswers.findMany({
    where: { assistantId },
  })
  if (answers.length < questions.length) {
    return questions
  }
  return questions.map((question) => {
    const answer = answers.find((answer) => answer.questionId === question.id)
    return {
      ...question,
      value: answer?.answer ?? null,
      notes: answer?.notes ?? null,
    }
  })
}
