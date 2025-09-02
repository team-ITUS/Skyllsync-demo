import React, { useState, useRef, useEffect } from 'react';
import './ActionMenu.css'; // Styles as before

/**
 * ActionMenu: A dropdown menu for table actions with auto-positioning.
 *
 * Props:
 *  - trigger: React node to click (e.g., '•••')
 *  - options: Array of {
 *      title: string,
 *      icon: string,
 *      onClick: () => void,
 *    }
 */
export default function ActionMenu({ trigger, options }) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = e => {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const drawerHeight = options.length * 60 + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < drawerHeight);
    }
    setOpen(v => !v);
  };

  return (
    <span className="action-menu-wrapper" ref={wrapperRef}>
      <span className="action-menu-trigger" onClick={toggle}>{trigger ? trigger : <img src='dots_b.svg'/>}</span>

      {open && (
        <div className={`action-drawer ${openUpward ? 'up' : 'down'}`}>          
          {options.map((opt, i) => (
            <div
              key={i}
              className="action-drawer-item"
              onClick={() => {
                setOpen(false);
                opt.onClick();
              }}
            >
              {opt.icon && <img src={opt.icon} alt={opt.title} className="action-icon" />} 
              <span className="action-title">{opt.title}</span>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}
