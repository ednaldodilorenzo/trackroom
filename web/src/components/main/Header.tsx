import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { BsArrowLeftSquare } from "react-icons/bs";


type HeaderConfig = {
  title: string;
  titleLink?: string;
  enableBackButton?: boolean;
  backButtonLink?: string;
  children?: React.ReactNode;
  hidden?: boolean;
};

export default function Header({
  title,
  titleLink,
  enableBackButton,
  children,
  hidden = false,
}: HeaderConfig) {
  const navigate = useNavigate();
  return (
    <header className={`header flex justify-between align-center p-2 ${hidden ? "hidden" : ""}`}>
      <div className="flex items-center">
        {enableBackButton && (
          <button onClick={() => navigate(-1)} className="mr-4 cursor-pointer">
            <BsArrowLeftSquare size="1.7em" />
          </button>
        )}
        {titleLink ? <h1><Link to={titleLink}>{title}</Link></h1> : <h1>{title}</h1>}
        {children}
      </div>
    </header>
  );
}

export type { HeaderConfig };
