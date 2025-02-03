/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("uxm1kqsw64qq27c")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "semu577p",
    "maxSelect": 1,
    "maxSize": 209715200,
    "mimeTypes": [
      "application/pdf"
    ],
    "name": "file",
    "presentable": true,
    "protected": true,
    "required": true,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("uxm1kqsw64qq27c")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "semu577p",
    "maxSelect": 1,
    "maxSize": 52428800,
    "mimeTypes": [
      "application/pdf"
    ],
    "name": "file",
    "presentable": true,
    "protected": true,
    "required": true,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
})
