import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare, BsBoxArrowInRight } from "react-icons/bs";

type HeaderConfig = {
  title: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
  logout?: () => void;
};

export default function Header({
  title,
  enableBackButton,
  backButtonLink,
  logout,
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
      <button onClick={logout}>
        <BsBoxArrowInRight size="1.7em" className="logout-icon" />
      </button>
    </header>
  );
}

export type { HeaderConfig };
