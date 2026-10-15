import { useStoreData } from '../../context/StoreDataContext.jsx';

export default function AnnouncementBar() {
  const { homepage } = useStoreData();
  return <div className="announcement-bar">{homepage.announcementText}</div>;
}
