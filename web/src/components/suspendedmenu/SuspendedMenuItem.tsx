type SuspendedMenuItemProps = {
    label: string;
    onClick: () => void;
};

export default function SuspendedMenuItem({ label, onClick, ...rest }: SuspendedMenuItemProps) {
    return (
        <button
            {...rest}
            onClick={onClick}
            style={{ height: "42px" }}
            className="w-full text-left px-4 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
        >
            {label}
        </button>
    );
}