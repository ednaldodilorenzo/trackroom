import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import SuspendedMenuItem from "./SuspendedMenuItem";

interface MenuItem {
  label: string;
  onClick: () => void;
}

export interface SuspendedMenuProps {
  items: MenuItem[];
}

export default function SuspendedMenu({ items }: SuspendedMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button onClick={toggleMenu}>
        <BsThreeDotsVertical size="1.5em" className="logout-icon" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {items.map((item, index) => (
              <SuspendedMenuItem
                key={index}
                label={item.label}
                onClick={() => {
                  item.onClick();
                  handleClickOutside(new MouseEvent("mousedown", { bubbles: true }));
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
