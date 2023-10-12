import { upsertSummary } from '../../../../upsert-summary'

export default {
  async afterCreate(event) {
    await upsertSummary({ summaryId: event.params.data.web_page_summary })
  },
}
