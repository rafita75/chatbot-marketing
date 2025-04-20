import React from 'react';

const NewChatButton = ({ onClick }) => {
  return (
    <button className="new-chat-btn" onClick={onClick}>
      + Nuevo Chat
    </button>
  );
};

export default NewChatButton;