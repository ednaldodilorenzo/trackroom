import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare } from "react-icons/bs";
import SuspendedMenu, {
  type SuspendedMenuProps,
} from "../suspendedmenu/SuspendedMenu";

type HeaderConfig = {
  title: string;
  titleLink?: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
  suspendedMenuProps?: SuspendedMenuProps;
  children?: React.ReactNode;
  hidden?: boolean;
};

export default function Header({
  title,
  titleLink,
  enableBackButton,
  backButtonLink,
  suspendedMenuProps,
  children,
  hidden = false,
}: HeaderConfig) {
  return (
    <header  className={`header flex justify-between align-center p-2 ${hidden ? "hidden" : ""}`}>
      <div className="flex items-center">
        {enableBackButton && (
          <Link className="mr-4" to={backButtonLink || "/"}>
            <BsArrowLeftSquare size="1.7em" />
          </Link>
        )}
        {titleLink ? <h1><Link to={titleLink}>{title}</Link></h1> : <h1>{title}</h1>}
        {children}
      </div>
      {suspendedMenuProps && (
        <SuspendedMenu items={suspendedMenuProps.items}></SuspendedMenu>
      )}
    </header>
  );
}

export type { HeaderConfig };
