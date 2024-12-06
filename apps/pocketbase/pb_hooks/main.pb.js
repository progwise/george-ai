/// <reference path="../pb_data/types.d.ts" />

onRecordUpdate((e) => {
  try {
    var url = $os.getenv('GAI_WEBHOOK_URL')
    console.log('sending webhook to:', url)
    const res = $http.send({
      method: 'GET',
      url: url,
    })
  } catch (e) {
    console.error('error sending hook:', e)
  } finally {
    e.next()
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
  } catch (e) {
    console.error('error sending hook:', e)
  } finally {
    e.next()
  }
}, 'documents')
