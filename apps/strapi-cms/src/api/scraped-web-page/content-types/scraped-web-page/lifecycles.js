import { updateTypesenseDocument } from "@george-ai/typesense-client";


module.exports =   {
  afterCreate(event) {
    updateTypesenseDocument(event.params.data)
  },
  afterUpdate(event) {
    updateTypesenseDocument(event.params.data)
  },
};
