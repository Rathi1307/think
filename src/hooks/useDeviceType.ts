import { useState, useEffect } from "react";

export function useDeviceType() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkIsMobile();

        // Debounce resize handler for performance could be added here if needed,
        // but for simple switching, direct listener is often fine or we can keep it simple.
        window.addEventListener("resize", checkIsMobile);

        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    return { isMobile };
}
