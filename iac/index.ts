import { network, subnetwork } from "./src/network";
import { sqlInstance } from "./src/database";
import { backendApi, loadBalance, loadBalancerIp } from "./src/backend";
import { artifactoryRegistry } from "./src/registry";

export const networkUrl = network.selfLink;
export const subnetworkUrl = subnetwork.selfLink;
export const sqlInstanceUlr = sqlInstance.selfLink;
export const backendApiUlr = backendApi.uri;
export const artifactoryRegistryUrl = artifactoryRegistry.repositoryId;
export const loadBalanceUrl = loadBalance.selfLink;
export const loadBalanceIpAddress = loadBalancerIp.address;
