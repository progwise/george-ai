'use client'

import { useState } from 'react'

export const ChatUI = () => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'george'; text: string }[]
  >([])
  const [text, setText] = useState<string>('')

  const handleClick = async () => {
    setMessages((old) => [...old, { sender: 'user', text: text }])
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    })
    const result = await response.json()
    setMessages((old) => [...old, { sender: 'george', text: result.response }])
    setText('')
  }

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 shadow-lg rounded-lg p-4 overflow-scroll">
      {/* <div className="chat-header sticky top-0 bg-primary">George AI</div> */}
      <div className="">
        <div className="chat chat-start">
          <div className="chat-bubble">Welcome to George AI</div>
        </div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${
              message.sender === 'user' ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className="chat-bubble">{message.text}</div>
          </div>
        ))}
      </div>

      <div className="chat chat-end">
        <div className="chat-bubble">
          <textarea
            placeholder="Enter your message"
            value={text}
            onChange={(text) => setText(text.target.value)}
            className="textarea textarea-bordered text-neutral"
          ></textarea>
          <br />
          <button
            onClick={() => {
              handleClick()
            }}
            className="btn btn-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
