'use client';

import { useState } from 'react';

import { consumer } from '../utils/teds';

const MessageComposer = () => {
  const [message, setMessage] = useState('');

  const onButtonClicked = async () => {
    await fetch(
      `http://localhost:8787/api/message/new?${new URLSearchParams({
        message,
      })}`,
      { method: 'POST' },
    );
    setMessage('');
  };

  return (
    <div>
      <h2>Compose a message</h2>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="message"
      />
      <button type="button" onClick={onButtonClicked}>
        Send message
      </button>
    </div>
  );
};

const MessageViewer = () => {
  const [messages, setMessages] = useState<{ id: string; message: string }[]>(
    [],
  );
  consumer.newChatMessage.useEvent((message) => {
    setMessages((m) => [...m, message]);
  });

  return (
    <div>
      <h2>Echoed messages</h2>
      {messages.map((m) => (
        <div key={m.id}>{m.message}</div>
      ))}
    </div>
  );
};

export default function Page() {
  return (
    <consumer.Provider url="ws://localhost:8787/api/events">
      <MessageComposer />

      <MessageViewer />
    </consumer.Provider>
  );
}
