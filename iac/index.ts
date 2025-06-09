import { network, subnetwork } from "./src/network";
import { database } from "./src/database";
import { backendApi, loadBalance, loadBalancerIp } from "./src/backend";
import { artifactoryRegistry } from "./src/registry";

export const networkUrl = network.selfLink;
export const subnetworkUrl = subnetwork.selfLink;
export const databaseUlr = database.selfLink;
export const backendApiUlr = backendApi.uri;
export const artifactoryRegistryUrl = artifactoryRegistry.repositoryId;
export const loadBalanceUrl = loadBalance.selfLink;
export const loadBalanceIpAddress = loadBalancerIp.address;
