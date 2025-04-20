import React from "react";
import "../styles/BubbleBackground.css";

const BubbleBackground = () => {
  // Generamos 15 burbujas con posiciones y tamaños aleatorios
  const bubbles = Array.from({ length: 60 }).map((_, index) => ({
    id: index,
    size: Math.random() * 20 + 10, // Tamaño entre 10px y 30px
    left: Math.random() * 100, // Posición horizontal 0-100%
    delay: Math.random() * 5, // Retardo de animación 0-5s
    duration: Math.random() * 20 + 10 // Duración 10-20s
  }));

  return (
    <div className="bubbles-container">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            opacity: 0.3 + Math.random() * 0.5 // Opacidad 0.3-0.8
          }}
        />
      ))}
    </div>
  );
};

export default BubbleBackground;