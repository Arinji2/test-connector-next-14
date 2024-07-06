import { LedgerId } from "@hashgraph/sdk";
import {
  DAppConnector,
  HederaChainId,
  HederaJsonRpcExtendedMethod,
  HederaJsonRpcMethod,
  HederaSessionEvent,
} from "@kabila-tech/hedera-wallet-connect";
import { ASSETS_CDN_URL } from "@kabila-tech/kabila-sdk";
import { SignClientTypes } from "@walletconnect/types";

import { IS_TESTNET_MODE } from "../utils";

const appMetadata: SignClientTypes.Metadata = {
  name: "Kabila Token",
  url: "https://token.kabila.app",
  description: "Discover, collect and support your favorite NFT Collections.",
  icons: [`${ASSETS_CDN_URL}logos/market/light.svg`, `${ASSETS_CDN_URL}logos/market/dark.svg`],
};

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "94edbacb24d178aceb9cda4c81400cf8";
const _extensionIds = process.env.NEXT_PUBLIC_EXTENSION_IDS ?? "cnoepnljjcacmnjnopbhjelpmfokpijm";
const extensionIds = _extensionIds.split(",");

export let dAppConnector: DAppConnector | null = null;

export async function createDAppConnector() {
  if (dAppConnector) return;
  dAppConnector = new DAppConnector(
    appMetadata,
    IS_TESTNET_MODE ? LedgerId.TESTNET : LedgerId.MAINNET,
    projectId,
    [...Object.values(HederaJsonRpcMethod), ...Object.values(HederaJsonRpcExtendedMethod)],
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
    [IS_TESTNET_MODE ? HederaChainId.Testnet : HederaChainId.Mainnet],
    extensionIds,
    {
      projectId,
      explorerRecommendedWalletIds: [
        "c40c24b39500901a330a025938552d70def4890fffe9bd315046bd33a2ece24d",
        "a29498d225fa4b13468ff4d6cf4ae0ea4adcbd95f07ce8a843a1dee10b632f3f",
      ],
    }
  );
}
