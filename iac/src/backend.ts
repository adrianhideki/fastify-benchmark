// https://medium.com/develop-everything/create-a-cloud-run-service-and-https-load-balancer-with-pulumi-3ba542e60367

import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { database } from "./database";
import { networkConnector } from "./network";

const config = new pulumi.Config();
const prefix = config.require("name-prefix");
const dbPassword = config.require("dbPassword");
const apiName = config.require("apiName");
const region = gcp.config.region ?? "";
const project = gcp.config.project ?? "";
const stack = pulumi.getStack() ?? "";

const backendApi = new gcp.cloudrunv2.Service(
  `${prefix}-cloud-run`,
  {
    name: `${prefix}-api`,
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
            instances: [database.connectionName],
          },
        },
      ],
      containers: [
        {
          image: pulumi.interpolate`${region}-docker.pkg.dev/${project}/${prefix}-repository/${apiName}-${stack}:latest`,
          ports: { containerPort: 8080 },
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
              value: pulumi.interpolate`postgresql://postgresql:${encodeURIComponent(
                dbPassword
              )}@${database.privateIpAddress}:5432/blog?schema=public`,
            },
          ],
          livenessProbe: {
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
  { dependsOn: [database] }
);

const loadBalancerIp = new gcp.compute.GlobalAddress(
  `${prefix}-global-address`,
  {
    addressType: "EXTERNAL",
  }
);

const endpointGroup = new gcp.compute.RegionNetworkEndpointGroup(
  `${prefix}-endpoint-group`,
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
  `${prefix}-backend-service`,
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
  `${prefix}-url-map`,
  {
    defaultService: backendService.id,
    hostRules: [
      {
        hosts: ["api-test.hydk.com.br"],
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
  `${prefix}-http-proxy`,
  {
    urlMap: urlMap.selfLink,
  },
  {
    dependsOn: [urlMap],
  }
);

const loadBalance = new gcp.compute.GlobalForwardingRule(
  `${prefix}-load-balancer`,
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
