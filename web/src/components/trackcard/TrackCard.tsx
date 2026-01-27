import { Link } from "react-router-dom";
import type { Group } from "@/model";
import "./TrackCard.css";
import { BsFillPeopleFill } from "react-icons/bs";

export default function TrackCard({ name, description, id }: Group) {
  return (
    <Link to={`/groups/${id}/musics`}>
      <div className="track-card">
        <BsFillPeopleFill size={30} className="track-cover" />

        <div className="track-info">
          <div className="track-title">{name}</div>
          <div className="track-artist">{description}</div>
        </div>
      </div>
    </Link>
  );
}
