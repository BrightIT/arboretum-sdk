import { CreateClientParams } from "../../../../arboretum-client";
import { getRandomNumber } from "../../../../utils/get-rendom-number";
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_HOST,
  DEFAULT_RETRY_LIMIT,
  DEFAULT_RETRY_ON_ERROR,
} from "../constants";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getRetryDelay = (retry: number) =>
  Math.ceil(Math.pow(getRandomNumber(1.2, 1.4), retry) * 1000);

const contentfulFetchWithRetires = <T>(
  p: () => Promise<Response>,
  retryLimit: number,
  retry: number = 0
): Promise<T> =>
  p().then(async (res) => {
    if (res.ok) {
      return res.json();
    } else if (
      retry < retryLimit &&
      (res.status === 429 || res.status === 500)
    ) {
      const delay = getRetryDelay(retry);
      const msg = `Waiting for ${delay}ms before retrying... (retry: ${retry + 1}/${retryLimit})`;
      if (res.status === 500) {
        console.log(`[warning] Internal server error occurred. ${msg}`);
      } else if (res.status === 429) {
        console.log(`[warning] Rate limit occurred. ${msg}`);
      }
      await sleep(delay);
      return contentfulFetchWithRetires(p, retryLimit, retry + 1);
    } else {
      return res
        .json()
        .then((res) => {
          throw res;
        })
        .catch((_) => {
          throw res;
        });
    }
  });

export const contentfulFetch =
  (config: CreateClientParams) =>
  <T>(endpoint: string, query: Record<string, string | number>): Promise<T> => {
    const { space, accessToken } = config;
    const host = config.host || DEFAULT_HOST;
    const environment = config.environment || DEFAULT_ENVIRONMENT;
    const params = new URLSearchParams();
    params.append("access_token", accessToken);
    Object.entries(query).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    const retryLimit = config.retryLimit || DEFAULT_RETRY_LIMIT;
    const retryOnError = config.retryOnError || DEFAULT_RETRY_ON_ERROR;

    return contentfulFetchWithRetires<T>(
      () =>
        fetch(
          `https://${host}/spaces/${space}/environments/${environment}${endpoint}?${params.toString()}`,
          { method: "GET" }
        ),
      retryOnError ? retryLimit : 0
    );
  };
