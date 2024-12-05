/// <reference path="../pb_data/types.d.ts" />

onRecordUpdate((e) => {
  console.log('documents updated3...', JSON.stringify(e.record, null, 2))
  try {
    var url = $os.getenv('GAI_WEBHOOK_URL')
    console.log('sending webhook to:', url)
    const res = $http.send({
      method: 'GET',
      url: url,
    })
    console.log('webhook response:', res)
    e.next()
  } catch (e) {
    console.error('error sending hook:', e)
  }
}, 'documents')

onRecordCreate((e) => {
  console.log('documents created3...', JSON.stringify(e.record, null, 2))
  try {
    var url = $os.getenv('GAI_WEBHOOK_URL')
    console.log('sending webhook to:', url)
    const res = $http.send({
      method: 'GET',
      url: url,
    })
    console.log('webhook response:', res)
    e.next()
  } catch (e) {
    console.error('error sending hook:', e)
  }
}, 'documents')
