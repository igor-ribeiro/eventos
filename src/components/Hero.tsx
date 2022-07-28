import { FC, ReactNode } from "react";

type Position = "start" | "center" | "end";

const POSITION_CLASSES: Record<Position, string> = {
  start: "items-start",
  end: "items-end",
  center: "place-items-center",
};

export const Hero: FC<{
  children: ReactNode;
  image?: string | null;
  fullScreen?: boolean;
  position?: Position;
}> = ({ image, fullScreen, position = "center", children }) => {
  return (
    <header
      className={`hero bg-base-200 min-h-[200px] bg-center ${
        POSITION_CLASSES[position]
      } ${fullScreen ? "h-screen" : "h-[50vh]"}`}
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-white">
        <div className="max-w-md">{children}</div>
      </div>
    </header>
  );
};
