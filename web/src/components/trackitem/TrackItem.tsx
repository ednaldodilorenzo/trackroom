import "./TrackItem.css";
import type { Music } from "@/model";

export default function TrackItem({
  name,
  artist,
  album,
  duration,
  active,
  avatar,
}: Music) {
  return (
    <div className={`track-item ${active ? "active" : ""}`}>
      <img src={avatar} alt="" className="track-avatar" />
      <div className="track-meta">
        <div className="track-title">{name}</div>
        <div className="track-sub">
          {artist} - {album}
        </div>
      </div>
      <div className="track-duration">{duration}</div>
    </div>
  );
}
