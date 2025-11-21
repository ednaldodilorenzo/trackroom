import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare } from "react-icons/bs";

interface HeaderConfig {
  title: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
}

export default function Header({
  title,
  enableBackButton,
  backButtonLink,
}: HeaderConfig) {
  return (
    <header className="header">
      {enableBackButton ? (
        <Link className="mr-2" to={backButtonLink || "/home"}>
          <BsArrowLeftSquare size="1.7em" />
        </Link>
      ) : (
        <div className="menu-icon">☰</div>
      )}
      <h1>{title}</h1>
    </header>
  );
}

export type { HeaderConfig };