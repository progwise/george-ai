import pLimit from 'p-limit'

import { conf } from '../../conf'

export const ROOT_DIR = conf('UPLOADS_PATH')

export const GLOBAL_STORAGE_LIMIT = pLimit(20)
