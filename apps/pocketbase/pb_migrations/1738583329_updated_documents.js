/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("uxm1kqsw64qq27c");
  collection.fields.addAt(1, new Field({
    
    // update field
    hidden: false,
    id: "semu577p",
    maxSelect: 1,
    maxSize: 209715200,
    mimeTypes: ["application/pdf"],
    name: "file",
    presentable: true,
    protected: true,
    required: true,
    system: false,
    thumbs: null,
    type: "file",
  }));

  return app.save(collection);
});
