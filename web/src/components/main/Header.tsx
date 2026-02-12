import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare } from "react-icons/bs";
import SuspendedMenu, {
  type SuspendedMenuProps,
} from "../suspendedmenu/SuspendedMenu";

type HeaderConfig = {
  title: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
  suspendedMenuProps?: SuspendedMenuProps;
  children?: React.ReactNode;
};

export default function Header({
  title,
  enableBackButton,
  backButtonLink,
  suspendedMenuProps,
  children,
}: HeaderConfig) {
  return (
    <header className="header flex justify-between align-center p-2">
      <div className="flex items-center">
        {enableBackButton && (
          <Link className="mr-4" to={backButtonLink || "/"}>
            <BsArrowLeftSquare size="1.7em" />
          </Link>
        )}
        <h1>{title}</h1>
        {children}
      </div>
      {suspendedMenuProps && (
        <SuspendedMenu items={suspendedMenuProps.items}></SuspendedMenu>
      )}
    </header>
  );
}

export type { HeaderConfig };
