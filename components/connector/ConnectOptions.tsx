"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { HASHPACK_WALLET_PEER_NAME, KABILA_WALLET_PEER_NAME } from "@kabila-tech/kabila-sdk";
import { useMedia } from "react-use";

import { dAppConnector } from "@/lib/modules/DAppConnector";
import { useConnector } from "@/hooks/connector/useConnector";

import Logo from "../Logo";

const DEEP_LINK_URL = process.env.NEXT_PUBLIC_DEEP_LINK_URL;

function ConnectOptions({ callback }: { callback?: () => void }) {
  const { connectExtension, connect, connectMobile } = useConnector();
  const [uri, setUri] = useState<string>("");
  const isMobile = useMedia("(max-width: 768px)", false);

  useEffect(() => {
    if (isMobile && !uri) handleMobileConnect();
  }, [isMobile]);

  const availableExtensions = useMemo(
    () => dAppConnector?.extensions?.filter((ext) => ext.available && ext.icon && ext.name) ?? [],
    [dAppConnector?.extensions]
  );

  const handleConnectExtension = async (extensionId: string) => {
    try {
      if (callback) callback();
      await connectExtension(extensionId);
    } catch (e) {
      console.error("Error Connecting Extension Wallet: ", e);
    }
  };

  const handleWalletConnect = async () => {
    try {
      if (callback) callback();
      await connect();
    } catch (error) {
      console.error("Error Connecting Wallet: ", error);
    }
  };

  const handleMobileConnect = async () => {
    try {
      if (callback) callback();
      await connectMobile((uri) => {
        setUri(uri);
      });
    } catch (error) {
      console.error("Error Connecting Wallet: ", error);
    }
  };

  return (
    <div className="space-y-4">
      {availableExtensions.map((ext) => (
        <div
          key={ext.id}
          className="w-200 flex h-20 cursor-pointer justify-center rounded-xl px-8 py-4 shadow-[0px_7px_29px_0px_rgb(0_0_0/0.1)] transition-transform hover:scale-105"
          onClick={() => handleConnectExtension(ext.id)}
        >
          {ext.name === HASHPACK_WALLET_PEER_NAME ? (
            <Logo path={"logos/hashpack"} width={250} height={50} withTheme extension="png" />
          ) : (
            <Logo
              path={ext.name === KABILA_WALLET_PEER_NAME ? "logos/wallet" : ext.icon ?? ""}
              width={200}
              height={50}
              withTheme
            />
          )}
        </div>
      ))}
      {isMobile && availableExtensions.length === 0 && (
        <a
          href={`${DEEP_LINK_URL}wc?uri=${uri}`}
          className="w-200 flex h-20 cursor-pointer justify-center rounded-xl px-8 py-4 shadow-[0px_7px_29px_0px_rgb(0_0_0/0.1)] transition-transform hover:scale-105"
          onClick={() => {
            if (callback) callback();
          }}
        >
          <Logo path={"logos/wallet"} width={200} height={50} withTheme />
        </a>
      )}
      <div className="w-200 flex h-20 cursor-pointer justify-center rounded-xl px-8 py-4 shadow-[0px_7px_29px_0px_rgb(0_0_0/0.1)] transition-transform hover:scale-105">
        <Image
          src="/images/wallet-connect.webp"
          alt="Wallet Connect"
          width={300}
          height={75}
          onClick={handleWalletConnect}
        />
      </div>
    </div>
  );
}

export default ConnectOptions;
