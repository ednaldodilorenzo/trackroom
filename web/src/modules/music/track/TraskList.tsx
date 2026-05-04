import TrackListItem from "./TrackListItem";

interface TrackListItemProps {
  children?: React.ReactNode;
}

export default function TrackList({ children }: TrackListItemProps) {
  return (
    <div>
      {children}
    </div>
  );
}

TrackList.Item = TrackListItem;