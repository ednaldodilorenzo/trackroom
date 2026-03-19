import type { Group } from "@/model";
import {
  createContext,
  useContext,
  useState,  
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface GroupContextType {
  currentGroup: Group;
  setCurrentGroup: Dispatch<SetStateAction<Group>>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [currentGroup, setCurrentGroup] = useState<Group>({
    name: "",
    description: "",
    active: false,
    cover: "",
  });
  const contextValue: GroupContextType = {
    currentGroup,
    setCurrentGroup,
  };
  return (
    <GroupContext.Provider value={contextValue}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }
  return context;
};
