import { appName } from "@/app.config";
import { HeaderLogo } from "@common/components/Header";
import { ShareIcon } from "@common/components/Icons";
import { PropsWithChildren } from "react";

export const MinimalHeader = ({ children }: PropsWithChildren) => {
  return (
    <header className="not-prose absolute flex items-center justify-between w-content w-content-sm left-1/2 -translate-x-1/2 top-0 z-40 p-2">
      <HeaderLogo appName={appName} />
      {children}
    </header>
  );
};
