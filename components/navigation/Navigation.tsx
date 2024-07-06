"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { MessageKeys, useTranslations } from "next-intl";

import AccountSettings from "./AccountSettings";
import KabilaApps from "./KabilaApps";
import ConnectButton from "../connector/ConnectButton";

function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-header dark:border-none">
      <nav className="container flex h-16 items-center justify-between gap-6 p-4">
        <Link href="/">
          <Image
            src="/images/kbl.svg"
            alt="KBL"
            width={40}
            height={40}
            quality={100}
            priority
          />
        </Link>
        <LayoutGroup id="nav">
          <ul className="hidden flex-1 items-center gap-4 md:flex">
            <NavItem title="staking" href="/staking" />
            <NavItem title="claims" href="/claims" />
            <NavItem title="airdrops" href="/airdrops" />
          </ul>
        </LayoutGroup>
        <div className="flex items-center gap-2">
          <KabilaApps />
          <AccountSettings />
          <ConnectButton /> 
        </div>
      </nav>
    </header>
  );
}

const NavItem = ({ title, href }: { title: string; href: string }) => {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const isActive = pathname === href;

  return (
    <li className="relative text-sm">
      <Link href={href} aria-label={`Go to ${title} page`}>
        {t(title as MessageKeys<string, any>)}
      </Link>
      {isActive && (
        <motion.div
          className="absolute -bottom-0.5 left-1/4 z-[5] h-0.5 w-1/2 bg-primary"
          layoutId="nav"
          transition={{
            duration: 0.2,
          }}
        />
      )}
    </li>
  );
};
export default Navigation;
