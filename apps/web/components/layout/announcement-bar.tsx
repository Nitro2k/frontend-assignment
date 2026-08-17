import { AnnouncementBarDismiss } from "@/components/layout/announcement-bar-dismiss";

export function AnnouncementBar() {
  return (
    <AnnouncementBarDismiss>
      Sign up and get 20% off to your first order.{" "}
      <span className="font-medium underline">Sign Up Now</span>
    </AnnouncementBarDismiss>
  );
}
