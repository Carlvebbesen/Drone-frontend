"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import navigation from "@/lib/navigation";
import { Button } from "../ui/button";
import { DroneLogo } from "../logo/droneLogo";
import { signInWithPopupCustom, signOut } from "@/lib/firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const DesktopNavigation = () => {
  const pathname = usePathname();
  const { isSignedIn, user } = useContext(AuthContext);
  return (
    <NavigationMenu className="mt-3  px-6 min-w-full h-20 flex justify-between">
      <div className="flex items-center justify-start">
        <Link href="/">
          <DroneLogo />
        </Link>
      </div>

      {isSignedIn ? (
        <NavigationMenuList className="w-full gap-x-20 grow">
          {navigation.map((item, i) => {
            const active = pathname === item.href;

            return (
              <NavigationMenuItem key={i}>
                <Link href={item.href}>
                  <Button variant={active ? "outline" : "link"}>
                    {item.label}
                  </Button>
                </Link>
              </NavigationMenuItem>
            );
          })}
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                {user && (
                  <p className="text-start w-full">
                    Velkommen tilbake, {user.displayName} !
                  </p>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </NavigationMenuList>
      ) : (
        <NavigationMenuItem key={"loginLink"}>
          <Button onClick={() => signInWithPopupCustom()} variant={"outline"}>
            {"LogIn"}
          </Button>
        </NavigationMenuItem>
      )}
    </NavigationMenu>
  );
};
export default DesktopNavigation;
