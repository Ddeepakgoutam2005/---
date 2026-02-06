import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        
        // Center the cursor mover on the mouse coordinates
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });

        // Create quickSetter for performance
        const xSet = gsap.quickSetter(cursor, "x", "px");
        const ySet = gsap.quickSetter(cursor, "y", "px");

        const onMouseMove = (e) => {
            xSet(e.clientX);
            ySet(e.clientY);
        };

        const onMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .nav-link, .clickable, input, select, textarea, [role="button"], .cursor-hover');
            
            if (isClickable) {
                setIsActive(true);
            }
        };

        const onMouseOut = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .nav-link, .clickable, input, select, textarea, [role="button"], .cursor-hover');
            
            if (isClickable) {
                setIsActive(false);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return (
        <div id="cursor-container">
            <div ref={cursorRef} className="cursor-mover" style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
                <div className={`cursor-circle ${isActive ? 'active' : ''}`}></div>
            </div>
        </div>
    );
};

export default CustomCursor;
