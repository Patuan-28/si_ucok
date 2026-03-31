import React, { useEffect, useRef } from 'react';
import './EmojiPicker.css';

export default function EmojiPicker() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    // Inject raw HTML because <select> with <button>/<selectedcontent> 
    // is experimental and React's virtual DOM can't handle it natively.
    wrapperRef.current.innerHTML = `
      <select class="emoji-select">
        <button>
          <selectedcontent></selectedcontent>
        </button>
        <option>🤔</option>
        <option>❤️</option>
        <option>🤣</option>
        <option>🤡</option>
        <option>🐷</option>
        <option>😻</option>
        <option>🤠</option>
      </select>
    `;
  }, []);

  return <div className="emoji-picker-wrapper" ref={wrapperRef} />;
}
