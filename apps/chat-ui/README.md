# API Usage

### Start the Server

Run the server:

```bash
node server.js
```

By default, the server will start on [http://localhost:3000](http://localhost:3000).

---

### API Endpoints

#### `POST /api/chat`

Send a question to the chat assistant.

- **Headers**:  
  `Content-Type: application/json`

- **Body**:

  ```json
  {
    "sessionId": "your_session_id", // Optional
    "question": "your_question" // Required
  }
  ```

- **Response**:
  ```json
  {
    "response": "George-AI's response to your question."
  }
  ```

#### Example

Use `curl` to test the endpoint:

```bash
curl -X POST http://localhost:3000/api/chat \
-H "Content-Type: application/json" \
-d '{
  "sessionId": "test_session",
  "question": "What are some travel tips for Paris?"
}'
```
