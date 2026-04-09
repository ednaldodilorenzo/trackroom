import "./ListItem.css";


type ListItemProps = {
    title: string;
    description?: string;
    detail?: string;
    //actionItems?: SuspendedMenuProps;
    children?: React.ReactNode;
};

export default function ListItem({
    title,
    description,
    detail,
    //actionItems,
    children,
    ...rest
}: ListItemProps) {
    return (

        <div className="list-item" {...rest}>
            <div className="list-meta">
                <div className="list-title">{title}</div>
                <div className="list-sub">{description}</div>
            </div>
            {detail && <div className="list-detail">{detail}</div>}
            {children}
        </div>

    );
}