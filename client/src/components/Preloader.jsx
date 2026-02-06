import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
    const preloaderRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.random() * 10;
                const newProgress = prev + increment;
                
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return newProgress;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            // Exit animation
            const tl = gsap.timeline({
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });

            tl.to(preloaderRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                delay: 0.5 // Short delay after reaching 100%
            })
            .set(preloaderRef.current, {
                visibility: 'hidden'
            });
        }
    }, [progress, onComplete]);

    return (
        <div ref={preloaderRef} className="preloader-container">
            <div className="glitch-container">
                <div className="glitch" data-text="CAPSTONE">CAPSTONE</div>
                <div className="glitch-subtitle" data-text="SYSTEM">System</div>
                <div className="glitch-subtitle" data-text="INITIALIZING">Initializing</div>
            </div>
            <div className="loading-bar">
                <div 
                    className="loading-progress" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="scroll-indicator" style={{ opacity: 0.7 }}>
                <span>LOADING ASSETS... {Math.round(progress)}%</span>
            </div>
        </div>
    );
};

export default Preloader;
