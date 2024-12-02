/// <reference path="../pb_data/types.d.ts" />

onRecordUpdate((e) => {
  console.log('documents updated...', JSON.stringify(e.record, null, 2))

  e.next()
}, 'documents')

onRecordCreate((e) => {
  console.log('documents created...', JSON.stringify(e.record, null, 2))

  e.next()
}, 'documents')
