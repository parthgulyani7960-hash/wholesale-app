import React, { useState, useMemo, useEffect } from 'react';

interface TutorialOverlayProps {
    onFinish: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [targetElement, setTargetElement] = useState<Element | null>(null);

    const steps = useMemo(() => [
        {
            target: '.location-selector',
            text: "Welcome! Start by setting your delivery location to see products and delivery options for your area.",
            position: 'bottom',
        },
        {
            target: '.group', // A product card
            text: 'Browse our collection. Swipe left on a product on mobile for quick actions like adding to cart or wishlist!',
            position: 'bottom',
        },
        {
            target: 'button.relative:has(svg[d^="M3 3h2l"])', // Cart icon button selector
            text: 'Your cart is always here. Click to review your items and checkout.',
            position: 'left',
        },
        {
            target: 'body',
            text: "You're all set! Enjoy a seamless shopping experience. Happy shopping!",
            position: 'center'
        }
    ], []);
    
    const currentStep = steps[step];

    useEffect(() => {
        const updateTargetElement = () => {
            const el = document.querySelector(currentStep.target);
            setTargetElement(el);
        };
        // A small delay to ensure the element is in the DOM after a step change
        const timer = setTimeout(updateTargetElement, 100);
        return () => clearTimeout(timer);
    }, [step, currentStep.target]);


    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            onFinish();
        }
    };

    const getTooltipPosition = () => {
        if (!targetElement || currentStep.position === 'center') {
            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
        
        const rect = targetElement.getBoundingClientRect();
        const styles: React.CSSProperties = { transform: 'translateX(-50%)' };

        if (currentStep.position === 'bottom') {
            styles.top = `${rect.bottom + 15}px`;
            styles.left = `${rect.left + rect.width / 2}px`;
        } else if (currentStep.position === 'top') {
            styles.bottom = `${window.innerHeight - rect.top + 15}px`;
            styles.left = `${rect.left + rect.width / 2}px`;
        } else { // left
            styles.top = `${rect.top + rect.height / 2}px`;
            styles.right = `${window.innerWidth - rect.left + 15}px`;
            styles.left = 'auto';
            styles.transform = 'translateY(-50%)';
        }
        return styles;
    };
    
    const getOverlayStyle = (): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            transition: 'clip-path 0.3s ease-in-out',
        };

        if (!targetElement || currentStep.position === 'center') {
            return baseStyle;
        }

        const rect = targetElement.getBoundingClientRect();
        const margin = 10;
        const top = rect.top - margin;
        const left = rect.left - margin;
        const width = rect.width + margin * 2;
        const height = rect.height + margin * 2;
        
        return {
            ...baseStyle,
            clipPath: `path(evenodd, 'M-1,-1 H${window.innerWidth+1} V${window.innerHeight+1} H-1 Z M${left},${top} h${width} v${height} h-${width} Z')`,
        };
    };

    return (
        <div className="fixed inset-0 z-[1001]" style={{ pointerEvents: 'none' }}>
            <div style={getOverlayStyle()} />
            <div
                style={{ ...getTooltipPosition(), position: 'fixed', pointerEvents: 'auto', zIndex: 1002 }}
                className="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-center"
            >
                <p className="text-primary mb-4">{currentStep.text}</p>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={onFinish} className="text-sm text-gray-500 hover:underline">Skip</button>
                    <button
                        onClick={nextStep}
                        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors"
                    >
                        {step === steps.length - 1 ? 'Finish' : `Next (${step + 1}/${steps.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;