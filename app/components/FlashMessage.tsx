import { RiAlertLine, RiCheckLine, RiCloseCircleLine } from 'react-icons/ri';
import React, { useState, useEffect } from 'react';

interface FlashMessageProps {
    message: string;
    newFlashMessageFlag: string,
    duration: number;
    type: "success" | "alert" | "caution";
}

export default function FlashMessage({ message, newFlashMessageFlag, duration, type }: FlashMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [newFlashMessageFlag]);

    const color = () => {
        switch (type) {
            case "success": return "bg-green-600"
            case "alert": return "bg-red-600"
            case "caution": return "bg-yellow-600"
        }
    }

    if (!isVisible) return null;

    return (
        <div className='fixed bottom-4 w-full px-4 flex max-md:justify-center md:justify-end'>
            <div className={`flex items-center text-white p-4 md:w-96 max-md:w-full rounded-lg shadow-lg ${color()}`}>
                <div className='mr-2 w-12 flex-grow-0 flex-1'>
                    {type === "success" ? <RiCheckLine size={30} /> : null}
                    {type === "alert" ? <RiCloseCircleLine size={30} /> : null}
                    {type === "caution" ? <RiAlertLine size={30} /> : null}
                </div>
                <div className=''>{decodeURIComponent(message)}</div>
            </div>
        </div>
    );
}
