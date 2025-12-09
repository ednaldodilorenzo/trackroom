import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare, BsThreeDotsVertical } from "react-icons/bs";
import SuspendedMenu, {
  type SuspendedMenuProps,
} from "../suspendedmenu/SuspendedMenu";

type HeaderConfig = {
  title: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
  suspendedMenuProps?: SuspendedMenuProps;
};

export default function Header({
  title,
  enableBackButton,
  backButtonLink,
  suspendedMenuProps,
}: HeaderConfig) {
  return (
    <header className="header flex justify-between align-center p-2">
      <div className="flex items-center">
        {enableBackButton ? (
          <Link className="mr-2" to={backButtonLink || "/home"}>
            <BsArrowLeftSquare size="1.7em" />
          </Link>
        ) : (
          <div className="menu-icon">☰</div>
        )}
        <h1>{title}</h1>
      </div>
      {suspendedMenuProps && (
        <SuspendedMenu items={suspendedMenuProps.items}></SuspendedMenu>
      )}
    </header>
  );
}

export type { HeaderConfig };
