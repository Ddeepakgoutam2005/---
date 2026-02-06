import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BackgroundAnimation.css';

const BackgroundAnimation = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create Circle Line
        const createCircleLine = () => {
            const circleLine = document.createElement('div');
            Object.assign(circleLine.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 50, 80, 0.3)',
                borderTop: '1px solid rgba(255, 50, 80, 0.8)',
                boxSizing: 'border-box',
                pointerEvents: 'none'
            });
            container.appendChild(circleLine);

            gsap.to(circleLine, {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: 'none',
                transformOrigin: 'center center'
            });

            gsap.to(circleLine, {
                x: 100,
                y: 80,
                duration: 12,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Large Circle
            const largeCircleLine = document.createElement('div');
            Object.assign(largeCircleLine.style, {
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 50, 80, 0.2)',
                borderLeft: '1px solid rgba(255, 50, 80, 0.6)',
                boxSizing: 'border-box',
                pointerEvents: 'none'
            });
            container.appendChild(largeCircleLine);

            gsap.to(largeCircleLine, {
                rotation: -360,
                duration: 30,
                repeat: -1,
                ease: 'none',
                transformOrigin: 'center center'
            });

            gsap.to(largeCircleLine, {
                x: -120,
                y: -70,
                duration: 18,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        };

        // Create Diagonal Lines
        const createDiagonalLines = () => {
            for (let i = 0; i < 3; i++) {
                const diagonalLine = document.createElement('div');
                const top = 20 + (i * 30);
                Object.assign(diagonalLine.style, {
                    position: 'absolute',
                    top: `${top}%`,
                    left: '-10%',
                    width: '150%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 50, 80, 0.5), transparent)',
                    transform: 'rotate(-15deg)',
                    pointerEvents: 'none',
                    opacity: 0.7
                });
                container.appendChild(diagonalLine);

                const diagonalTl = gsap.timeline({ repeat: -1 });
                diagonalTl.to(diagonalLine, {
                    x: -200,
                    y: 50,
                    duration: 15 + (i * 3),
                    ease: 'sine.inOut'
                }).to(diagonalLine, {
                    x: -400,
                    y: -50,
                    duration: 15 + (i * 3),
                    ease: 'sine.inOut'
                }).to(diagonalLine, {
                    x: -600,
                    y: 0,
                    duration: 15 + (i * 3),
                    ease: 'sine.inOut'
                });

                gsap.to(diagonalLine, {
                    opacity: 0.2,
                    duration: 8 + (i * 2),
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });
            }
        };

        // Create Corner Lines
        const createCornerLines = () => {
            // Top-left
            const cornerLine = document.createElement('div');
            Object.assign(cornerLine.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '150px',
                height: '1px',
                background: 'rgba(255, 50, 80, 0.8)',
                transformOrigin: 'top left',
                transform: 'rotate(45deg) scaleX(0)',
                pointerEvents: 'none'
            });
            container.appendChild(cornerLine);

            const cornerTl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
            cornerTl.to(cornerLine, {
                scaleX: 1,
                rotation: '45deg',
                duration: 2,
                ease: 'power2.out'
            }).to(cornerLine, {
                y: 30,
                duration: 3,
                ease: 'sine.inOut'
            }, '-=0.5').to(cornerLine, {
                y: 0,
                duration: 3,
                ease: 'sine.inOut'
            }).to(cornerLine, {
                scaleX: 0,
                duration: 2,
                ease: 'power2.in'
            });

            // Bottom-right
            const cornerLine2 = document.createElement('div');
            Object.assign(cornerLine2.style, {
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '200px',
                height: '1px',
                background: 'rgba(255, 50, 80, 0.8)',
                transformOrigin: 'bottom right',
                transform: 'rotate(45deg) scaleX(0)',
                pointerEvents: 'none'
            });
            container.appendChild(cornerLine2);

            const cornerTl2 = gsap.timeline({ repeat: -1, repeatDelay: 5, delay: 2.5 });
            cornerTl2.to(cornerLine2, {
                scaleX: 1,
                duration: 2,
                ease: 'power2.out'
            }).to(cornerLine2, {
                scaleX: 0,
                duration: 2,
                ease: 'power2.in',
                delay: 3
            });
        };

        // Create Pulse Line
        const createPulseLine = () => {
            const pulseLine = document.createElement('div');
            Object.assign(pulseLine.style, {
                position: 'absolute',
                top: '50%',
                right: '0',
                width: '100px',
                height: '1px',
                background: 'rgba(255, 50, 80, 0.8)',
                transformOrigin: 'center right',
                pointerEvents: 'none'
            });
            container.appendChild(pulseLine);

            const pulseTl = gsap.timeline({ repeat: -1 });
            pulseTl.to(pulseLine, {
                scaleX: 4,
                opacity: 0.2,
                x: -50,
                duration: 2,
                ease: 'power2.out'
            }).to(pulseLine, {
                scaleX: 1,
                opacity: 0.8,
                x: 0,
                duration: 1.5,
                ease: 'back.out(1.7)'
            }).to(pulseLine, {
                y: 30,
                duration: 2,
                ease: 'sine.inOut'
            }).to(pulseLine, {
                y: 0,
                duration: 2,
                ease: 'sine.inOut'
            });
        };

        // Create Falling Stars
        const createFallingStars = () => {
            const starCount = 20;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                Object.assign(star.style, {
                    position: 'absolute',
                    top: '-10px',
                    left: `${Math.random() * 100}%`,
                    width: '2px',
                    height: '2px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8)',
                    opacity: Math.random(),
                    pointerEvents: 'none',
                    zIndex: 0
                });
                container.appendChild(star);

                const duration = 2 + Math.random() * 3;
                const delay = Math.random() * 5;

                gsap.to(star, {
                    y: '100vh',
                    ease: 'none',
                    repeat: -1,
                    duration: duration,
                    delay: delay,
                    onRepeat: () => {
                        star.style.left = `${Math.random() * 100}%`;
                        star.style.opacity = Math.random();
                    }
                });
            }
        };

        createCircleLine();
        createDiagonalLines();
        createCornerLines();
        createPulseLine();
        createFallingStars();

        return () => {
            // Cleanup: remove all children and kill tweens
            // GSAP usually handles GC well, but we should kill tweens if we had references.
            // Since we created elements dynamically, removing them from DOM is enough for basic cleanup,
            // but explicitly killing tweens is better. However, without references it's hard.
            // gsap.globalTimeline.clear() might be too aggressive if other components use GSAP.
            // For now, clearing innerHTML removes elements.
            if (container) container.innerHTML = '';
        };
    }, []);

    return <div ref={containerRef} className="animated-lines-container"></div>;
};

export default BackgroundAnimation;
