"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Keyboard,
  LayoutDashboard,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function NavbarMain() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    ...(role === "USER"
      ? [
          { name: "Create Query", link: "/create" },
          { name: "Dashboard", link: "/dashboard" },
          { name: "Be Support Agent", link: "/be-support-agent" },
        ]
      : []),
    ...(role === "ADMIN"
      ? [
          { name: "Dashboard", link: "/dashboard" },
          { name: "Upgrade Requests", link: "/upgrade-requests" },
        ]
      : []),
  ];

  return (
    <Navbar className="">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        {role !== "SUPPORT_AGENT" && <NavItems items={navItems} />}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
             
                <Keyboard className="w-6 h-6" />
              <NavbarButton
                onClick={() => signOut()}
                variant="secondary"
                className="border-red-600 text-red-400 hover:bg-neutral-800 bg-transparent"
              >
                Sign Out
              </NavbarButton>
            </>
          ) : (
            <NavbarButton
              onClick={() => {
                  router.push("/signin")
                }}
              variant="secondary"
              className="border-green-600 text-green-400 hover:bg-neutral-800 bg-transparent"
            >
              Login
            </NavbarButton>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="bg-black text-white"
        >
          {role !== "SUPPORT_AGENT" &&
            navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}

          <div className="flex w-full flex-col gap-4 mt-4">
            {session?.user ? (
              <div className="flex items-center gap-2">
                 (
                  <Keyboard className="w-10 h-10" />
                <NavbarButton
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  className="border-red-600 text-red-400 hover:bg-neutral-800 bg-transparent"
                >
                  Sign Out
                </NavbarButton>
              </div>
            ) : (
              <NavbarButton
                onClick={() => {
                  router.push("/signin")
                }}
                variant="secondary"
                className="border-green-600 text-green-400 hover:bg-neutral-800 bg-transparent"
              >
                Login
              </NavbarButton>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export default NavbarMain;
