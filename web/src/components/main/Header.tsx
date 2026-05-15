import { Link } from "react-router-dom";
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
  backButtonLink,
  hidden = false,
}: HeaderConfig) {  
  return (
    <header className={`header flex justify-between align-center p-2 ${hidden ? "hidden" : ""}`}>
      <div className="flex items-center">
        {enableBackButton && (
          <Link to={backButtonLink ?? "#"} className="mr-4 cursor-pointer">
            <BsArrowLeftSquare size="1.7em" />
          </Link>
        )}
        {titleLink ? <h1><Link to={titleLink}>{title}</Link></h1> : <h1>{title}</h1>}
        {children}
      </div>
    </header>
  );
}

export type { HeaderConfig };
