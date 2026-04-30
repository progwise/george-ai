# Overview of Event Service Actions

## Examples

| Subject                                                                       | Payload                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workspace.4711.request.inference.chat-completion                              | messages, URIs for attachments/imsages, ChatCompletionCallSchema Selects a healthy model host that serves the model - very often used with fulfill, postponed publish/subscribe implementation.           |
| workspace.4711.response.inference.chat-completion                             | the response of a chat completion, ChatCompletionResponseSchema For real publish only. Should contain the original call as well                                                                           |
| workspace.4711.invoke.inference.chat-completion                               | for direct nats request/respond (naming?), same ChatCompletionCallSchema no response will be published, this is a direct call, the fulfill should use the same ChatCompletionResponseSchema               |
| workspace.4711.request.inference.embedding                                    | takes a list of strings, EmbedingRequestSchema List of string, this is a different action than embedDocument - we need to consider better naming                                                          |
| workspace.4711.response.inference.embedding                                   | EmbedingResponseSchema                                                                                                                                                                                    |
| workspace.4711.invoke.inference.embedding                                     | EmbedingRequestSchema answers direct with EmbedingResponseSchema                                                                                                                                          |
| workspace.4711.request.modelhost.5812.test-connection                         | TestConnectionRequestSchema                                                                                                                                                                               |
| workspace.4711.response.modelhost.5812.test-connection                        | TestConnectionResponseSchema                                                                                                                                                                              |
| workspace.4711.invoke.modelhost.5812.test-connection                          | TestConnectionRequestSchema & TestConnectionResponseSchema                                                                                                                                                |
| workspace.4711.<request or reponse or invoke>.modelhost.5812.status-report    | StatusReportRequestSchema & StatusReportResponseSchema                                                                                                                                                    |
| workspace.4711.<request or reponse or invoke>.modelhost.5812.available-models | AvailableModelsRequestSchema & AvailableModelsResponseSchema                                                                                                                                              |
| workspace.4711.<request or response>.document.5913.extract                    | ExtractDocumentRequest, ExtractDocumentResponse, needs several inference requests or invokes, no need for invoking these because it runs linger                                                           |
| workspace.4711.<request or response>.document.5913.embed                      | EmbedDocumentRequest, EmbedDocumentResponse : Splits into chunks and generates vectors and stores the vectors, needs several inference and other calls, no need for invoking these because it runs linger |
| workspace.4711.<request or response>.list.6014.generate-items                 | GenerateListItemRequest, GenerateListItemResponse reads library documents, extractions and generates list items from these                                                                                |
| workspace.4711.<request or response>.list.6014.field.6115.enrich              | EnrichListItemRequest, EnrichListItemResponse also needs inference invokes                                                                                                                                |

Subjects that I think we do not need:

- Getting a healthy model host : This is just one or more registry lookups or in some cases a separate model.host invoke like testconnection
-

Missing subjects ?
