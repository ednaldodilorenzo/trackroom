import { BsPerson } from "react-icons/bs";
import "./GroupMember.css";

type GroupMemberProps = {
  id: number;
  name: string;
  admin: boolean;
};

export default function GroupMember({ id, name, admin }: GroupMemberProps) {
  return (
    <div className="group-member">
      {id && (
        <button>
          <BsPerson />
        </button>
      )}
      <div className="group-member-meta">
        <div className="group-member-title">{name}</div>
        <div className="group-member-sub">Teste</div>
      </div>
      <div className="group-member-detail">{admin ? "Admin" : ""}</div>
    </div>
  );
}
