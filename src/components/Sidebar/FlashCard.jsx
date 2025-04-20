import React from 'react';
import '../../styles/FlashCard.css';

const FlashCard = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="flash-card-overlay">
      <div className="flash-card">
        <div className="flash-card-content">
          <p>{message}</p>
        </div>
        <div className="flash-card-actions">
          <button className="flash-card-btn confirm" onClick={onConfirm}>
            Confirmar
          </button>
          <button className="flash-card-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;