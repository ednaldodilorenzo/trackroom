import { Link } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare, BsBoxArrowInRight } from "react-icons/bs";
import { store } from "@/store";
import { logout } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";

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
    <header className="header">
      {enableBackButton ? (
        <Link className="mr-2" to={backButtonLink || "/home"}>
          <BsArrowLeftSquare size="1.7em" />
        </Link>
      ) : (
        <div className="menu-icon">☰</div>
      )}
      <h1>{title}</h1>
      <button onClick={logout}>
        <BsBoxArrowInRight size="1.7em" className="logout-icon" />
      </button>
    </header>
  );
}

export type { HeaderConfig };
