import { createUserAvatarFile } from './create-user-avatar-file'
import { deleteUserAvatars } from './delete-user-avatars'
import { deleteUserFile } from './delete-user-file'
import { deleteUserFolder } from './delete-user-folder'
import { existsUserFile } from './exists-user-file'
import { listUserFiles } from './list-user-files'
import { readUserAvatar } from './read-user-avatar'
import { readUserFile } from './read-user-file'
import { writeUserAvatar } from './write-user-avatar'
import { writeUserFile } from './write-user-file'

export default {
  createAvatar: createUserAvatarFile,
  writeFile: writeUserFile,
  deleteFile: deleteUserFile,
  deleteAvatars: deleteUserAvatars,
  deleteFolder: deleteUserFolder,
  existsFile: existsUserFile,
  listFiles: listUserFiles,
  readAvatar: readUserAvatar,
  readFile: readUserFile,
  writeAvatar: writeUserAvatar,
}

export {
  createUserAvatarFile,
  deleteUserFile,
  deleteUserFolder,
  listUserFiles,
  readUserFile,
  readUserAvatar,
  writeUserFile,
  writeUserAvatar,
  deleteUserAvatars,
  existsUserFile,
}
