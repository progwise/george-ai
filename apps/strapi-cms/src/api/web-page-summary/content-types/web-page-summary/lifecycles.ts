import { updateTypesenseDocument } from "@george-ai/typesense-client";


export default  {
  afterCreate(event) {
    updateTypesenseDocument(event.params.data)
  },
  afterUpdate(event) {
    updateTypesenseDocument(event.params.data)
  },
};
