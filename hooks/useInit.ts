"use client";

import { useInitConnector } from "./connector/useConnector";
import { useHederaNodes } from "./connector/useHederaNodes";

function useInit() {
  useInitConnector();
  useHederaNodes();
}

export default useInit;
