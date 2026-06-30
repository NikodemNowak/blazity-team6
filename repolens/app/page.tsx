import { redirect } from "next/navigation";

// The home route opens the primary working surface. (The old mock dashboard was
// removed; Chat is the real entry point.)
export default function Home() {
  redirect("/chat");
}
