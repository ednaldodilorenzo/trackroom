import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import SuspendedMenuItem from "./SuspendedMenuItem";

export interface SuspendedMenuProps {
  children: React.ReactNode;
}

export default function SuspendedMenu({ children }: SuspendedMenuProps) {
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
      <button style={{ verticalAlign: "middle" }} className="cursor-pointer" onClick={toggleMenu}>
        <BsThreeDotsVertical size="1.5em" className="logout-icon" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 p-3 rounded-md shadow-lg bg-white ring-opacity-5 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

SuspendedMenu.Item = SuspendedMenuItem;