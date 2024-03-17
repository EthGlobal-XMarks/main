import { useState, useEffect } from "react";

export default function useWindowDimensions() {
    const [width, setWidth] = useState(undefined);
    const [height, setHeight] = useState(undefined);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        }

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return { width: Number(width), height: Number(height) };
}