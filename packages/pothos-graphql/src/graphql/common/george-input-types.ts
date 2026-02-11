import { VectorStoreChunksSelector } from '@george-ai/vector-store'

import { ModelProviderInput } from '../language-model/model-provider-input'
import { LibraryInput } from '../library/library-input'
import { DateTimePeriod } from './date-time-period'

export interface GeorgeInputTypes {
  DateTimePeriod: DateTimePeriod
  FileChunksSelector: VectorStoreChunksSelector
  LibraryInput: LibraryInput
  ModelProviderInput: ModelProviderInput
}
