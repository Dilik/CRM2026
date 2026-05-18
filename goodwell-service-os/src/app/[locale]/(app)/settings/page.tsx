import { redirect } from "next/navigation";

export default function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  void params;
  redirect("settings/staff");
}
