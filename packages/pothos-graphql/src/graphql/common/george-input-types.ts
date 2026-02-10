import { VectorStoreChunksSelector } from '@george-ai/vector-store'

import { ModelProviderInput } from '../language-model/model-provider-input'
import { LibraryInput } from '../library/library-input'
import { DateTimePeriod } from './date-time-period'

export interface GeorgeInputTypes {
  DateTimePeriod: DateTimePeriod
  LibraryInput: LibraryInput
  FileChunksSelector: VectorStoreChunksSelector
  ModelProviderInput: ModelProviderInput
}
