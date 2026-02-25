type SuspendedMenuItemProps = {
    label: string;
    onClick: () => void;
};

export default function SuspendedMenuItem({ label, onClick, ...rest }: SuspendedMenuItemProps) {
    return (
        <button
            {...rest}
            onClick={onClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
            {label}
        </button>
    );
}