import { BsPlayCircle } from "react-icons/bs";
import "./TrackItem.css";
import type { Music } from "@/model";
import { Link } from "react-router-dom";

type TrackItemProps = Music & {
  active: boolean;
  onClick: () => void;
  cipherLink?: string;
  children?: React.ReactNode;
  canPlay: boolean;
};

export default function TrackItem({
  id,
  name,
  description,
  active,
  cipherLink,
  onClick,
  children,
  canPlay = true,
}: TrackItemProps) {
  return (
    <div className={`track-item ${active ? "active" : ""}`}>
      {id && (
        <button disabled={!canPlay}>
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
