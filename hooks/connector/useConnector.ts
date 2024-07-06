"use client";

import { useEffect, useRef } from "react";
import { DAppSigner } from "@kabila-tech/hedera-wallet-connect";
import {
  ErrorType,
  HederaNetwork,
  HederaWalletConnectClient,
  KabilaEnvironment,
  KabilaError,
  Klog,
  MirrorEnvironment,
  WEB_TESTNET_NODES_ACCOUNTS,
} from "@kabila-tech/kabila-sdk";
import { SessionTypes } from "@walletconnect/types";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCookie, useMedia } from "react-use";

import { createDAppConnector, dAppConnector } from "@/lib/modules/DAppConnector";
import { IS_TESTNET_MODE, withTimeout } from "@/lib/utils";

import { errorAtom, loadingDialogAtom, sureDialogAtom } from "../useControlledFunction";
import { hederaNodesAtom } from "./useHederaNodes";

const APP_ENVIRONMENT = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
const MIRROR_ENVIRONMENT = process.env.NEXT_PUBLIC_MIRROR_ENVIRONMENT;

export interface Account {
  id: string;
  alias: string;
  hederaNetwork: HederaNetwork;
  client: HederaWalletConnectClient;
  topic: string;
}

export interface SessionParams {
  session: SessionTypes.Struct;
  signers: DAppSigner[];
  isNew?: boolean;
}

export const accountAtom = atom<Account | null>(null);
export const accountsAtom = atom<Account[]>([]);
export const isExtensionConnectorReadyAtom = atom<boolean>(false);
export const isIframeAtom = atom<boolean>(false);
export const isLoadingAtom = atom<boolean>(true);

export const isAuthenticatingAtom = atom(false);
export const isAuthenticatedAtom = atom(false);
export const sessionsTokensAtom = atom<Record<string, string>>({});

const onSessionConnectedAtom = atom(null, async (get, set, params: SessionParams) => {
  const { session, signers, isNew } = params;
  try {
    Klog.wc.debug(`onSessionConnected`, "bg: yellow; color: black", session);
    if (!signers || signers.length === 0) {
      throw new Error("No signers found");
    }
    if (!APP_ENVIRONMENT || !MIRROR_ENVIRONMENT) {
      throw new Error("No environment found");
    }
    if (session && session.namespaces) {
      const { accounts } = session.namespaces.hedera;
      const network = IS_TESTNET_MODE ? HederaNetwork.Testnet : HederaNetwork.Mainnet;
      const properties = session.sessionProperties;
      const peerName = session.peer?.metadata?.name;

      const sessionAccountsPromises = accounts.map(async (sessionAccount: string) => {
        const accountId = sessionAccount.split(":")[2];

        const onAuthRequest = async () => {
          try {
            set(isAuthenticatingAtom, true);

            // Wait user approve to auth
            const isConfirmedAuth = await new Promise((resolve, reject) => {
              set(sureDialogAtom, {
                title: "test",
                descriptions: ["test"],
                onNext: () => {
                  resolve(true);
                },
                onBack: () => {
                  reject(false);
                },
              });
            });

            if (!isConfirmedAuth) throw new Error("User rejected auth request");

            // Display executing dialog while user approve transaction or cancel
            set(loadingDialogAtom, {
              open: true,
              title: "test",
              message: "test",
              onCancel: () => {
                Klog.info("User rejected open wallet request");
                set(loadingDialogAtom, { open: false });
              },
            });

            return {
              onSignEnd: () => set(loadingDialogAtom, { open: false }),
              onAuthEnd: (isAuth: boolean) => {
                set(isAuthenticatedAtom, isAuth);
                set(isAuthenticatingAtom, false);
              },
            };
          } catch (error) {
            set(loadingDialogAtom, { open: false });
            throw error;
          }
        };

        const signer = signers.find((signer) => signer.getAccountId().toString() === accountId);
        if (!signer) throw new Error("No signer found for account: " + accountId);

        // TODO find way to receive signature
        if (properties?.signature) {
          const sessionProperties = {
            ...session.sessionProperties,
          };
          delete sessionProperties.signature;
          await dAppConnector?.walletConnectClient?.session.update(session.topic, {
            sessionProperties,
          });
        }

        const isToolsCompatible = peerName === "Kabila Wallet";

        const _walletConnectClient = await HederaWalletConnectClient.build(
          accountId,
          properties?.publicKey,
          signer,
          properties?.signature || null,
          network,
          APP_ENVIRONMENT as KabilaEnvironment,
          { loginOnInit: true, isToolsCompatible },
          MIRROR_ENVIRONMENT as MirrorEnvironment,
          onAuthRequest
        );

        const sessionToken = get(sessionsTokensAtom)[accountId];
        if (sessionToken) _walletConnectClient.session = sessionToken;

        const getNodeAddressesWithTimeout = withTimeout<string[]>(
          _walletConnectClient.getNodeAddresses.bind(_walletConnectClient),
          2000
        );
        const nodes = await getNodeAddressesWithTimeout();
        const hederaNodes =
          network === HederaNetwork.Mainnet ? get(hederaNodesAtom) : Object.keys(WEB_TESTNET_NODES_ACCOUNTS);
        const availebleNodes = !nodes?.length ? hederaNodes : nodes.filter((node: any) => hederaNodes.includes(node));

        _walletConnectClient.initHederaClient(availebleNodes);

        return {
          id: accountId,
          alias: properties?.alias ?? peerName,
          hederaNetwork: network.toString(),
          cooldowns: [],
          client: _walletConnectClient,
          topic: session.topic,
        };
      });

      const sessionAccounts: Account[] = await Promise.all(
        sessionAccountsPromises.filter((account) => account) as Promise<Account>[]
      );
      const _accounts = get(accountsAtom);

      const _newAccounts = _accounts.filter((account) => !sessionAccounts.find((a) => a.id === account.id));

      set(accountsAtom, [..._newAccounts, ...sessionAccounts]);

      if (isNew) {
        const account = sessionAccounts[0];
        set(isAuthenticatedAtom, account.client.isAuth);
        set(accountAtom, account);
      }
    }
  } catch (error) {
    console.error("onSessionConnected error: ", error);
    if ((error as Error)?.message === "LOGIN_FAILED") {
      set(errorAtom, new KabilaError((error as Error)?.message, ErrorType.AUTHENTICATION, undefined, 9999));
    }
  } finally {
    if (isNew) set(isLoadingAtom, false);
  }
});

const connectAtom = atom(null, async (get, set) => {
  if (!dAppConnector) {
    throw new Error("WalletConnect is not initialized");
  }
  try {
    set(isLoadingAtom, true);
    const session = await dAppConnector.openModal();
    if (session) {
      const signers = dAppConnector.signers;
      set(onSessionConnectedAtom, { session, signers, isNew: true });
    }
  } catch (e) {
    console.error("Connector connect error: ", e);
    throw new Error("WalletConnect connection failed");
  }
});

const connectMobileAtom = atom(null, async (get, set, params: { launchCallback: (uri: string) => void }) => {
  const { launchCallback } = params;
  if (!dAppConnector) {
    throw new Error("WalletConnect is not initialized");
  }
  try {
    set(isLoadingAtom, true);
    const session = await dAppConnector?.connect(launchCallback);
    if (session) {
      const signers = dAppConnector.signers;
      set(onSessionConnectedAtom, { session, signers, isNew: true });
    }
  } catch (e) {
    console.error("Connector connect error: ", e);
    throw new Error("WalletConnect connection failed");
  }
});

const connectExtensionAtom = atom(null, async (get, set, params: { extensionId: string }) => {
  const { extensionId } = params;
  if (!dAppConnector) {
    throw new Error("WalletConnect is not initialized");
  }
  try {
    set(isLoadingAtom, true);
    const dialogPromise = new Promise((_, reject) => {
      set(loadingDialogAtom, {
        open: true,
        title: "test",
        message: "test",
        onCancel: () => {
          Klog.info("User rejected open wallet request");
          reject(new KabilaError("Request cancel", ErrorType.CONNECTOR, undefined, 3998));
        },
      });
    });

    const connectPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const session = await dAppConnector!.connectExtension(extensionId);
        if (session) {
          const signers = dAppConnector!.signers;
          set(onSessionConnectedAtom, { session, signers, isNew: true });
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });

    await Promise.race([dialogPromise, connectPromise]);
  } catch (e) {
    console.error("Connector connect error: ", e);
  } finally {
    set(loadingDialogAtom, { open: false });
  }
});

const disconnectAtom = atom(null, async (get, set, params: { id: string; topic: string }) => {
  if (!dAppConnector) {
    throw new Error("WalletConnect is not initialized");
  }
  const { id, topic } = params;
  try {
    await dAppConnector.disconnect(topic);
    dAppConnector.signers = dAppConnector.signers.filter((signer) => signer.topic !== topic);
    const _accounts = get(accountsAtom);
    const _newAccounts = _accounts.filter((account) => account.id !== id);
    if (get(accountAtom)?.id === id) {
      const _newAccount = _newAccounts.length ? _newAccounts[0] : null;
      set(accountAtom, _newAccount);
    }
    set(accountsAtom, _newAccounts);
  } catch (error) {
    console.error("WalletConnect disconnect failed:", error); // Todo translate
  }
});

export const useConnector = () => {
  const [account, setAccount] = useAtom(accountAtom);
  const [lastAccountId, setLastAccountId] = useCookie("KLastAccountId");
  const accounts = useAtomValue(accountsAtom);
  const connect = useSetAtom(connectAtom);
  const connectMobile = useSetAtom(connectMobileAtom);
  const connectExtension = useSetAtom(connectExtensionAtom);
  const disconnect = useSetAtom(disconnectAtom);
  const isLoading = useAtomValue(isLoadingAtom);

  const changeAccount = (id: string) => {
    const _account = accounts.find((account) => account.id === id);
    if (_account) {
      setAccount(_account);
      setLastAccountId(_account.id);
      //setIsAuthenticated(account?.client?.isAuth);
    }
  };

  return {
    account,
    lastAccountId,
    accounts,
    changeAccount,
    setLastAccountId,
    connect,
    connectMobile: (launchCallback: (uri: string) => void) => connectMobile({ launchCallback }),
    connectExtension: (extensionId: string) => connectExtension({ extensionId }),
    disconnect: (id: string, topic: string) => disconnect({ id, topic }),
    isLoading,
  };
};

export const useInitConnector = () => {
  const [account, setAccount] = useAtom(accountAtom);
  const [accounts, setAccounts] = useAtom(accountsAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [lastAccountId, setLastAccountId] = useCookie("KLastAccountId");
  const onSessionConnected = useSetAtom(onSessionConnectedAtom);

  const isMobile = useMedia("(max-width: 768px)", false);

  const accountsRef = useRef<Account[]>([]);
  const accountRef = useRef<Account | null>(null);

  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  useEffect(() => {
    if (isLoading || account?.id === lastAccountId || accounts.length === 0) return;
    const lastAccount = accounts.find((acc) => acc.id === lastAccountId);
    setAccount(lastAccount ?? accounts[0]);
  }, [lastAccountId, accounts, isLoading]);

  useEffect(() => {
    const initConnector = async () => {
      setIsLoading(true);
      await createDAppConnector();
      if (!dAppConnector) throw new Error("DAppConnector not initialized");
      await dAppConnector.init({ logger: "error" });

      dAppConnector.onSessionIframeCreated = (session) => {
        setIsLoading(true);
        onSessionConnected({ session, signers: dAppConnector?.signers ?? [], isNew: true });
      };

      const sessions = dAppConnector.walletConnectClient?.session.getAll();
      if (sessions?.length) {
        const signers = dAppConnector.signers;
        const promiseSession = sessions?.map((session) => onSessionConnected({ session, signers, isNew: false }));
        await Promise.all(promiseSession ?? []);
        setIsLoading(false);
      }

      if (!isMobile) {
        let start = Date.now();
        let intervalId = setInterval(() => {
          if (Date.now() - start >= 2200 || dAppConnector?.extensions?.filter((ext) => ext.available).length) {
            setIsLoading(false);
            clearInterval(intervalId);
          }
        }, 200);
      }

      dAppConnector.walletConnectModal.subscribeModal((state: any) => {
        if (!state?.open) setIsLoading(false);
      });

      dAppConnector?.walletConnectClient?.on("session_delete", (data) => {
        Klog.wc.debug("session_delete", "bg: gray; color: yellow", data);
        const _newAccounts = accountsRef.current.filter((account) => account.topic !== data.topic);
        if (accountRef.current?.topic === data.topic) {
          const _newAccount = _newAccounts.length ? _newAccounts[0] : null;
          setAccount(_newAccount);
        }
        setAccounts(_newAccounts);
      });

      dAppConnector?.walletConnectClient?.on("session_ping", (data) => {
        Klog.wc.debug("session_ping", "bg: gray; color: yellow", data);
      });
    };
    if (!dAppConnector) initConnector();
  }, []);
};
