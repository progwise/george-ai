I found an interesting project for the fine-tuning process. You can find it in the link below:

- https://github.com/h2oai/h2o-llmstudio

**Format of the training**

To train a chatbot-style model, you need to convert your data into a question-and-answer format.
If you really want to continue pretraining on your own data without teaching a question-answering style, prepare a dataset with all your data in a single column Dataframe. Make sure that the length of the text in each row is not too long. In the experiment setup, remove all additional tokens (e.g. <|prompt|>, <|answer|>, for Text Prompt Start and Text Answer Start respectively) and disable Add Eos Token To Prompt and Add Eos Token To Answer. Deselect everything in the Prompt Column.

An Example of a sample [train-data](train_full.csv).
