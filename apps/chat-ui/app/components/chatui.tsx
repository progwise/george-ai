'use client'

import { useEffect, useRef, useState } from 'react'
import { FaWindowMaximize, FaWindowMinimize } from 'react-icons/fa'

export const ChatUI = () => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'george'; text: string }[]
  >([])
  const [text, setText] = useState<string>('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (text.trim() === '') {
      return
    }
    setMessages((old) => [...old, { sender: 'user', text: text }])
    setText('')
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    })
    const result = await response.json()
    setMessages((old) => [...old, { sender: 'george', text: result.response }])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <div
      className={`fixed bottom-0 right-0 w-96 shadow-lg rounded-lg overflow-hidden flex flex-col ${
        isMinimized ? 'h-12' : 'h-96'
      }`}
    >
      <div className="sticky top-0 bg-primary text-primary-content p-2 flex justify-between items-center h-12">
        <span>George AI</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="btn btn-ghost btn-square"
        >
          {isMinimized ? <FaWindowMaximize /> : <FaWindowMinimize />}
        </button>
      </div>
      {!isMinimized && (
        <>
          <div className="flex-grow overflow-auto p-4">
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
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 bg-base-200 flex items-end">
            {/* <div className=" w-full"> */}
            <textarea
              placeholder="Enter your message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="textarea textarea-bordered w-full"
            ></textarea>
            {/* </div> */}
            <div className="pl-2">
              <button onClick={clearMessages} className="btn btn-sm">
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
