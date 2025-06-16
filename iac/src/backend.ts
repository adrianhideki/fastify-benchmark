// https://medium.com/develop-everything/create-a-cloud-run-service-and-https-load-balancer-with-pulumi-3ba542e60367

import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";
import { database, sqlInstance, user } from "./database";
import { networkConnector } from "./network";
import { artifactoryRegistry } from "./registry";
import {
  databaseUrlSecret,
  databaseUlrSecretAccess,
  sqlUserPasswordSecretSecreteAccess,
  sqlUserPasswordSecret,
} from "./secret";

const region = gcp.config.region ?? "";
const project = gcp.config.project ?? "";
const stack = pulumi.getStack();

const backendImage = new docker.Image(
  `api-${stack}`,
  {
    imageName: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${stack}-repository/api-${stack}:latest`,
    build: {
      context: "../",
      builderVersion: "BuilderBuildKit", // can also be set to `BuilderV1`
      cacheFrom: {
        images: [
          pulumi.interpolate`${region}-docker.pkg.dev/${project}/${stack}-repository/api-${stack}:latest`,
        ],
      },
      platform: "linux/amd64",
    },
  },
  { dependsOn: [artifactoryRegistry] }
);

const backendApi = new gcp.cloudrunv2.Service(
  `${stack}-cloud-run`,
  {
    name: `${stack}-api`,
    location: region,
    ingress: "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER",
    invokerIamDisabled: true,
    deletionProtection: false,
    template: {
      //https://cloud.google.com/run/docs/about-execution-environments
      // executionEnvironment: "EXECUTION_ENVIRONMENT_GEN1",
      maxInstanceRequestConcurrency: 80,
      scaling: {
        minInstanceCount: 0,
        maxInstanceCount: 10,
      },
      volumes: [
        {
          name: "cloudsql",
          cloudSqlInstance: {
            instances: [sqlInstance.connectionName],
          },
        },
      ],
      containers: [
        {
          image: backendImage.imageName,
          resources: {
            cpuIdle: true,
            limits: {
              cpu: "1",
              memory: "512Mi",
            },
          },
          envs: [
            {
              name: "DATABASE_URL",
              valueSource: {
                secretKeyRef: {
                  secret: databaseUrlSecret.id,
                  version: "latest",
                },
              },
            },
          ],
          livenessProbe: {
            initialDelaySeconds: 60,
            httpGet: {
              path: "/",
            },
          },
        },
      ],
      vpcAccess: {
        connector: networkConnector.id,
        egress: "ALL_TRAFFIC",
      },
    },
  },
  {
    dependsOn: [
      sqlInstance,
      networkConnector,
      backendImage,
      databaseUrlSecret,
      databaseUlrSecretAccess,
      sqlUserPasswordSecretSecreteAccess,
      database,
      user,
      sqlUserPasswordSecret,
    ],
  }
);

const loadBalancerIp = new gcp.compute.GlobalAddress(
  `${stack}-global-address`,
  {
    addressType: "EXTERNAL",
  }
);

const endpointGroup = new gcp.compute.RegionNetworkEndpointGroup(
  `${stack}-endpoint-group`,
  {
    networkEndpointType: "SERVERLESS",
    region: region,
    cloudRun: {
      service: backendApi.name,
    },
  },
  {
    dependsOn: [backendApi],
  }
);

const backendService = new gcp.compute.BackendService(
  `${stack}-backend-service`,
  {
    enableCdn: false,
    connectionDrainingTimeoutSec: 10,
    backends: [
      {
        group: endpointGroup.id,
      },
    ],
  },
  {
    dependsOn: [endpointGroup],
  }
);

const urlMap = new gcp.compute.URLMap(
  `${stack}-url-map`,
  {
    defaultService: backendService.id,
    hostRules: [
      {
        hosts: [`${stack}.wave.com.br`],
        pathMatcher: "all-paths",
      },
    ],
    pathMatchers: [
      {
        name: "all-paths",
        defaultService: backendService.id,
        pathRules: [
          {
            paths: ["/*"],
            service: backendService.id,
          },
        ],
      },
    ],
  },
  {
    dependsOn: [backendService],
  }
);

// use TargetHttpsProxy to specify a certificate and SSL
const httpProxy = new gcp.compute.TargetHttpProxy(
  `${stack}-http-proxy`,
  {
    urlMap: urlMap.selfLink,
  },
  {
    dependsOn: [urlMap],
  }
);

const loadBalance = new gcp.compute.GlobalForwardingRule(
  `${stack}-load-balancer`,
  {
    target: httpProxy.selfLink,
    ipAddress: loadBalancerIp.address,
    portRange: "8080",
    loadBalancingScheme: "EXTERNAL",
  },
  {
    dependsOn: [httpProxy, loadBalancerIp],
  }
);

export { backendApi, loadBalance, loadBalancerIp };
