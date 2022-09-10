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
      className={`hero bg-base-200 h-[70vh] bg-center relative overflow-hidden ${
        POSITION_CLASSES[position]
      } ${fullScreen ? "h-screen" : ""}`}
    >
      <div className="hero-content text-white w-full px-8 md:max-w-lg">
        <div
          className="absolute sm:blur w-full h-full top-0 left-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: image ? `url(${image})` : undefined,
          }}
        ></div>
        <div
          className="absolute w-full md:w-content-sm h-full top-0 left-1/2 translate-x-[-50%] bg-center bg-cover"
          style={{
            backgroundImage: image ? `url(${image})` : undefined,
          }}
        ></div>
        <div className="hero-overlay bg-opacity-60 absolute w-full h-full z-[1] top-0 left-0"></div>
        <div className="w-full md:max-w-md z-[2] static">{children}</div>
      </div>
    </header>
  );
};
