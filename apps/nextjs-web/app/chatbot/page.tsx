import React from 'react'

const ChatBotPage = () => {
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <div className="chat chat-start">
        <div className="chat-bubble chat-bubble-primary">
          What kind of nonsense is this
        </div>
      </div>
      <div className="chat chat-start">
        <div className="chat-bubble chat-bubble-secondary">
          Put me on the Council and not make me a Master!??
        </div>
      </div>
      <div className="chat chat-start">
        <div className="chat-bubble chat-bubble-accent">
          That&apos;s never been done in the history of the Jedi. It&apos;s
          insulting!
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble chat-bubble-info">Calm down, Anakin.</div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble chat-bubble-success">
          You have been given a great honor.
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble chat-bubble-warning">
          To be on the Council at your age.
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble chat-bubble-error">
          It&apos;s never happened before.
        </div>
      </div>
    </>
  )
}

export default ChatBotPage
