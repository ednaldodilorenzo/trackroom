import { Link } from "react-router-dom";
import type { Group } from "@/model";
import "./TrackCard.css";

export default function TrackCard({ name, description, cover, id }: Group) {
  return (
    <Link to={`/home/groups/${id}/musics`}>
      <div className="track-card">
        <img src={cover} alt={name} className="track-cover" />

        <div className="track-info">
          <div className="track-title">{name}</div>
          <div className="track-artist">{description}</div>
        </div>
      </div>
    </Link>
  );
}
