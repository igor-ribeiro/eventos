import { FC, ReactNode } from "react";

export const Hero: FC<{
  children: ReactNode;
  image?: string | null;
  fullScreen?: boolean;
}> = ({ image, fullScreen, children }) => {
  return (
    <header
      className={`hero bg-base-200 min-h-[200px] bg-center ${
        fullScreen ? "h-screen" : "h-[50vh]"
      }`}
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-white">
        <div className="max-w-md">{children}</div>
      </div>
    </header>
  );
};
