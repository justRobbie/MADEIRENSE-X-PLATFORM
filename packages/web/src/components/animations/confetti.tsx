import { 
    useCallback, 
    useEffect, 
    useMemo,
    useState
} from "react";

import type { 
    shapeType, 
    sizeType
} from "components/types";

// ***************************************************************************************************************

type confettiShapeType = shapeType | 'square' | 'triangle';

type ConfettiType = {
    id: number,
    x: number,
    y: number,
    rotation: number,
    color: string,
    shape: confettiShapeType,
    size: number,
    speedX: number,
    speedY: number,
    rotationSpeed: number
};

interface IConfettiAnimationProps {
    size?: sizeType;
    duration?: number;
    delay?: number;
    frames?: number;
    pieces?: number;
    defaultShape?: shapeType;
}

const ConfettiAnimation = ({ size = "s", defaultShape, pieces = 50, frames = 16.67, duration = 3000, delay = 5000 }: IConfettiAnimationProps) => {
    const [confetti, setConfetti] = useState<ConfettiType[]>([]);
    const [isActive, setIsActive] = useState(false);

    const generateConfetti = useCallback(() => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
        const shapes = ['square', 'circle', 'triangle'] as shapeType[];
        const sizes: Record<sizeType, { offset: number, shift: number }> = {
            "xs": { offset: 6, shift: 2 },
            "s": { offset: 8, shift: 4 },
            "m": { offset: 10, shift: 6 },
            "l": { offset: 12, shift: 8 },
            "xl": { offset: 24, shift: 18 },
        };

        const { offset, shift } = sizes[size];

        return Array.from({ length: pieces }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -10,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: defaultShape ?? shapes[Math.floor(Math.random() * shapes.length)],
            size: Math.random() * offset + shift,
            speedX: (Math.random() - 0.5) * 2,
            speedY: Math.random() * 20 + 16,
            rotationSpeed: (Math.random() - 0.5) * 10
        }));
    }, [pieces, size, defaultShape]);

    useEffect(() => {
        if (!isActive) return;

        let animationId: number;
        let lastTime = 0;

        function updateConfettiPositions (currentTime: number) {
            const deltaTime = currentTime - lastTime;

            // Only update if enough time has passed (60fps = ~16.67ms)
            if (deltaTime >= frames) {
                setConfetti(prevConfetti =>
                    prevConfetti
                        .map(piece => ({
                            ...piece,
                            x: piece.x + piece.speedX,
                            y: piece.y + piece.speedY,
                            rotation: piece.rotation + piece.rotationSpeed
                        }))
                        .filter(piece => piece.y < window.innerHeight + 50)
                );
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(updateConfettiPositions);
        };

        animationId = requestAnimationFrame(updateConfettiPositions);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isActive, frames]);

    useEffect(() => {
        const startConfetti = () => {
            setConfetti(generateConfetti());
            setIsActive(true);

            setTimeout(() => {
                setIsActive(false);
                setConfetti([]);
            }, duration);
        };

        setTimeout(() => startConfetti(), delay);
    }, [delay, duration, generateConfetti]);

    const confettiGroup = useMemo(() => confetti.map(piece => (
        <div
            key={piece.id}
            className={`absolute z-50 pointer-events-none ${(piece.shape === 'circle') ? 'rounded-full' : (piece.shape === 'triangle') ? 'transform rotate-45' : ''}`}
            style={{
                width: `${piece.size}px`,
                left: `${piece.x}px`,
                top: `${piece.y}px`,
                transform: `translate3d(${piece.x}px, ${piece.y}px, 0) rotate(${piece.rotation}deg)`,
                height: `${(piece.size * (piece.shape === "rect" ? 5 : 1))}px`,
                backgroundColor: piece.color,
                clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                willChange: 'transform'
            }}
        />
    )), [confetti]);

    return <>{confettiGroup}</>
};

export default ConfettiAnimation;