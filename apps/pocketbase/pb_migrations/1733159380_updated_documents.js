/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('uxm1kqsw64qq27c')

    // add field
    collection.fields.addAt(
      3,
      new Field({
        hidden: false,
        id: 'date4088109526',
        max: '',
        min: '',
        name: 'lastProcessed',
        presentable: false,
        required: false,
        system: false,
        type: 'date',
      }),
    )

    return app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('uxm1kqsw64qq27c')

    // remove field
    collection.fields.removeById('date4088109526')

    return app.save(collection)
  },
)
