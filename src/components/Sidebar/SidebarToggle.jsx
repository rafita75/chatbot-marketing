import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const SidebarToggle = ({ isOpen, setIsOpen }) => {

  return (
    <button 
      className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
    </button>
  );
};

export default SidebarToggle;