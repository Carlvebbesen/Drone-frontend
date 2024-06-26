import { AuthContextProvider } from "@/context/authContext";
import "./globals.css";
import type { Metadata } from "next";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Drone Control Center",
  description: "Drone control center for the tello inspection drones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="m-0 p-0">
      <body className="h-full m-0 p-0">
        <AuthContextProvider>
          <main className="min-h-screen flex flex-col">
            <DesktopNavigation />
            {children}
          </main>
          <Toaster richColors closeButton />
        </AuthContextProvider>
      </body>
    </html>
  );
}
