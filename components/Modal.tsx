
import React, { ReactNode, useEffect, useCallback, useState, Component, ErrorInfo } from 'react';

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ModalErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, ErrorBoundaryState> {
    constructor(props: { children: ReactNode; onReset: () => void }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Modal Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h4>
                    <p className="text-gray-600 text-sm mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            this.props.onReset();
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-accent hover:text-primary transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const Modal: React.FC<ModalProps> = ({ isOpen = false, onClose, title = '', children, size = 'md' }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 200);
            document.body.style.overflow = 'auto';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 bg-black z-[100] flex justify-center items-center p-4 transition-opacity duration-200 ${isAnimating ? 'bg-opacity-60' : 'bg-opacity-0'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} flex flex-col transition-all duration-200 ease-out ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 id="modal-title" className="text-2xl font-serif font-bold text-primary">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-150"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <ModalErrorBoundary onReset={onClose}>
                        {children}
                    </ModalErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default Modal;
