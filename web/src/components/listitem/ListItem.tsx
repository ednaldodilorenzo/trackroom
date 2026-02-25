import "./ListItem.css";
import type { SuspendedMenuProps } from "../suspendedmenu/SuspendedMenu";
import SuspendedMenu from "../suspendedmenu/SuspendedMenu";

type ListItemProps = {
    title: string;
    description?: string;
    detail?: string;
    actionItems?: SuspendedMenuProps;
};

export default function ListItem({
    title,
    description,
    detail,
    actionItems,
    ...rest
}: ListItemProps) {
    return (

        <div className="list-item" {...rest}>
            <div className="list-meta">
                <div className="list-title">{title}</div>
                <div className="list-sub">{description}</div>
            </div>
            {detail && <div className="list-detail">{detail}</div>}
            {actionItems && <SuspendedMenu {...actionItems} />}
        </div>

    );
}