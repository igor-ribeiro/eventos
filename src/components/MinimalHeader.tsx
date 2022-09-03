import { appName } from "@/app.config";
import { HeaderLogo } from "@common/components/Header";

export const MinimalHeader = () => {
  return (
    <header className="absolute w-content w-content-sm left-1/2 -translate-x-1/2 top-0 z-40 p-2">
      <HeaderLogo appName={appName} />
    </header>
  );
};
