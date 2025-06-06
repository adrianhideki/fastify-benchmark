import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const dbPassword = config.require("dbPassword");

// Create a VPC network to allow the machines to communicate
const network = new gcp.compute.Network("test-vpc-network", {
  autoCreateSubnetworks: false, // Create subnetworks manually
  name: "test-network",
  mtu: 1500, // or 1460, 8896
});

// Define the ip interval
const subnetwork = new gcp.compute.Subnetwork(
  "test-sub-network",
  {
    name: "test-subnetwork",
    ipCidrRange: "10.1.0.0/28",
    network: network.selfLink,
  },
  { dependsOn: [network] }
);

// Allow serverless services to connect to resources into the VPC
const networkConnector = new gcp.vpcaccess.Connector(
  "test-connector",
  {
    name: "test-vpc-connector",
    subnet: {
      name: subnetwork.name,
    },
    minInstances: 3,
    maxInstances: 5,
  },
  { dependsOn: [subnetwork] }
);

// outbound ip to access internet
const address = new gcp.compute.Address("test-address", {
  name: "test-outbound-static-ip-address",
});

// private ip address range to connect into a private network
const privateIpAddress = new gcp.compute.GlobalAddress("private_ip_address", {
  name: "private-ip-address",
  purpose: "VPC_PEERING",
  addressType: "INTERNAL",
  prefixLength: 16,
  network: network.id,
});

// allows google public internet services to connect at a private network
const privateVpcConnection = new gcp.servicenetworking.Connection(
  "private_vpc_connection",
  {
    network: network.id,
    service: "servicenetworking.googleapis.com",
    reservedPeeringRanges: [privateIpAddress.name],
  }
);

// manage the routes
const router = new gcp.compute.Router(
  "test-router",
  {
    name: "test-router",
    network: network.selfLink,
  },
  { dependsOn: [network] }
);

// allow private services to access internet in a VPC
const routerNat = new gcp.compute.RouterNat(
  "test-router-nat",
  {
    name: "test-router-nat",
    router: router.name,
    natIpAllocateOption: "MANUAL_ONLY",
    sourceSubnetworkIpRangesToNat: "LIST_OF_SUBNETWORKS",
    subnetworks: [
      {
        name: subnetwork.id,
        sourceIpRangesToNats: ["ALL_IP_RANGES"],
      },
    ],
    natIps: [address.selfLink],
  },
  { dependsOn: [router, subnetwork] }
);

const database = new gcp.sql.DatabaseInstance(
  "test-database",
  {
    name: "test-database",
    databaseVersion: "POSTGRES_15",
    region: "us-central1",
    settings: {
      tier: "db-f1-micro",
      backupConfiguration: {
        enabled: false,
        binaryLogEnabled: false,
      },
      ipConfiguration: {
        ipv4Enabled: true,
        privateNetwork: network.selfLink,
        enablePrivatePathForGoogleCloudServices: true,
        authorizedNetworks: [
          {
            name: address.name,
            value: address.address,
          },
        ],
      },
      databaseFlags: [
        { name: "log_temp_files", value: "0" },
        { name: "log_connections", value: "on" },
        { name: "log_lock_waits", value: "on" },
        { name: "log_disconnections", value: "on" },
        { name: "log_checkpoints", value: "on" },
      ],
      insightsConfig: {
        queryInsightsEnabled: true,
        queryStringLength: 2048,
        recordApplicationTags: true,
        recordClientAddress: true,
        queryPlansPerMinute: 10,
      },
      maintenanceWindow: {
        day: 7, //sunday
        hour: 0,
      },
    },
    rootPassword: dbPassword,
  },
  { dependsOn: [network, subnetwork, privateVpcConnection] }
);

// main.connectionName.get()
// main.publicIpAddress.get()
