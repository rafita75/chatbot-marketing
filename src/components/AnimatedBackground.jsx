import React from "react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";

const Bubble = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: rgba(110, 72, 170, 0.2);
  backdrop-filter: blur(5px);
  z-index: 0;
  pointer-events: none;
`;


const AnimatedBackground = () => {
  const bubbles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5
  }));

  return (
    <>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          initial={{ y: 0 }}
          animate={{
            y: [0, -20, 0],
            x: [bubble.x, bubble.x + Math.random() * 10 - 5, bubble.x]
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: bubble.delay
          }}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`
          }}
        />
      ))}
    </>
  );
};

export default AnimatedBackground;