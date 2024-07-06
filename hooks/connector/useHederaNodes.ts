import { Klog } from "@kabila-tech/kabila-sdk";
import { track } from "@vercel/analytics";
import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import useSWR from "swr";

const getOperationalNodes = async (url: string) => {
  const nodes = await fetch(url).then((res) => res.json());
  if (!nodes || !nodes.components) {
    track("Nodes API Error");
    return [];
  }
  return nodes.components
    ?.filter((component: any) => component.group_id === "85hy6ylrs85b" && component.status === "operational")
    .map((component: any) => {
      return "0.0." + (component.position + 2);
    });
};

export const hederaNodesAtom = atom<any>([]);

export const useHederaNodes = () => {
  const setHederaNodes = useSetAtom(hederaNodesAtom);
  const { data: nodes } = useSWR("https://status.hedera.com/api/v2/summary.json", getOperationalNodes, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    refreshInterval: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (nodes) {
      Klog.info("Hedera Nodes", nodes);
      setHederaNodes(nodes);
    }
  }, [nodes]);
};
