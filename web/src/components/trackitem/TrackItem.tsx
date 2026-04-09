import { BsPlayCircle } from "react-icons/bs";
import "./TrackItem.css";
import type { Music } from "@/model";
import { Link } from "react-router-dom";

type TrackItemProps = Music & {
  active: boolean;
  onClick: () => void;
  cipherLink?: string;
  children?: React.ReactNode;
};

export default function TrackItem({
  id,
  name,
  description,
  active,
  cipherLink,
  onClick,
  children,
}: TrackItemProps) {
  return (
    <div className={`track-item ${active ? "active" : ""}`}>
      {id && (
        <button>
          <BsPlayCircle onClick={onClick} size="2em" />
        </button>
      )}
      <div className="track-meta">
        <div className="track-title">{name}</div>
        <div className="track-sub">{description}</div>
      </div>
      {cipherLink && (
        <Link to={cipherLink} className="track-duration">
          Ver cifra
        </Link>
      )}
      {children}
    </div>
  );
}
