import "./TrackItem.css";
import type { Music } from "@/model";

type TrackItemProps = Music & {
  active: boolean;
  onClick: (id: number) => void;
};

export default function TrackItem({
  id,
  name,
  description,
  file,
  active,
  onClick,
}: TrackItemProps) {
  return (
    <div className={`track-item ${active ? "active" : ""}`}>
      {id && (
        <img onClick={() => onClick(id)} alt="" className="track-avatar" />
      )}
      <div className="track-meta">
        <div className="track-title">{name}</div>
        <div className="track-sub">{description}</div>
      </div>
      <div className="track-duration">10</div>
    </div>
  );
}
