import { AppHeader } from "@common/components/Header";
import { AddIcon } from "@common/components/Icons";
import Link from "next/link";

export const Header = () => {
  return (
    <AppHeader>
      <div className="flex justify-center">
        <Link href="/events/create">
          <a className="btn btn-primary btn-circle" title="Criar evento">
            <AddIcon size={28} />
          </a>
        </Link>
      </div>
    </AppHeader>
  );
};
