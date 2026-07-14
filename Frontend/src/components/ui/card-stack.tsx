/**
 * Card stack — cards pile with depth; the front card auto-cycles and can be
 * dragged away. Equivalent of 21st.dev @ruixen.ui/card-stack (registry is
 * auth-gated), rebuilt on our motion tokens.
 */
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { SPRING } from "@/lib/motion";
import { useMotionSafe } from "@/components/motion/use-motion-safe";

export interface StackCard {
  id: string;
  content: ReactNode;
}

interface CardStackProps {
  cards: StackCard[];
  className?: string;
  /** Fixed stack height — cards are absolutely positioned. */
  heightClass?: string;
  /** Auto-advance interval in ms; 0 disables. Paused on hover & reduced motion. */
  autoAdvanceMs?: number;
}

const VISIBLE = 3;
const DISMISS_DISTANCE = 90;

export function CardStack({
  cards,
  className = "",
  heightClass = "h-80",
  autoAdvanceMs = 4500,
}: CardStackProps) {
  const [order, setOrder] = useState(() => cards.map((c) => c.id));
  const [hovered, setHovered] = useState(false);
  const safe = useMotionSafe();

  const cycle = () => setOrder(([front, ...rest]) => [...rest, front]);

  useEffect(() => {
    if (!safe || hovered || !autoAdvanceMs || cards.length < 2) return;
    const t = setInterval(cycle, autoAdvanceMs);
    return () => clearInterval(t);
  }, [safe, hovered, autoAdvanceMs, cards.length]);

  const byId = new Map(cards.map((c) => [c.id, c]));

  return (
    <div
      className={`relative mx-auto w-full max-w-xl ${heightClass} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {order.slice(0, VISIBLE + 1).map((id, i) => {
        const card = byId.get(id);
        if (!card) return null;
        const isFront = i === 0;
        return (
          <motion.div
            key={id}
            className="absolute inset-0"
            style={{ zIndex: order.length - i }}
            animate={{
              y: i * 16,
              scale: 1 - i * 0.05,
              opacity: i > VISIBLE - 1 ? 0 : 1 - i * 0.12,
            }}
            transition={SPRING}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > DISMISS_DISTANCE) cycle();
            }}
            whileDrag={{ rotate: 3, cursor: "grabbing" }}
            onClick={isFront && !safe ? cycle : undefined}
          >
            {card.content}
          </motion.div>
        );
      })}
    </div>
  );
}
