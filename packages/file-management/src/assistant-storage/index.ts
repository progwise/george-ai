import { createAssistantIconFile } from './create-assistant-icon-file'
import { deleteAssistantFile } from './delete-assistant-file'
import { deleteAssistantIcons } from './delete-assistant-icons'
import { existsAssistantFile } from './exists-assistant-file'
import { listAssistantFiles } from './list-assistant-files'
import { readAssistantFile } from './read-assistant-file'
import { readAssistantIcon } from './read-assistant-icon'
import { writeAssistantFile } from './write-assistant-file'
import { writeAssistantIcon } from './write-assistant-icon'

export default {
  createIcon: createAssistantIconFile,
  writeFile: writeAssistantFile,
  deleteFile: deleteAssistantFile,
  deleteIcons: deleteAssistantIcons,
  existsFile: existsAssistantFile,
  listFiles: listAssistantFiles,
  readIcon: readAssistantIcon,
  readFile: readAssistantFile,
  writeIcon: writeAssistantIcon,
}

export {
  createAssistantIconFile,
  deleteAssistantFile,
  listAssistantFiles,
  readAssistantFile,
  readAssistantIcon,
  writeAssistantFile,
  writeAssistantIcon,
  deleteAssistantIcons,
  existsAssistantFile,
}
