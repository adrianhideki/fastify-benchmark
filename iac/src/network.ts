import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const stack = pulumi.getStack();

// Create a VPC network to allow the machines to communicate
const network = new gcp.compute.Network(`${stack}-vpc-network`, {
  autoCreateSubnetworks: false, // Create subnetworks manually
  name: `${stack}-network`,
  mtu: 1500, // or 1460, 8896
});

// private ip address range to connect into a private network
const privateIpAddress = new gcp.compute.GlobalAddress(
  `${stack}-private-ip-address`,
  {
    name: "private-ip-address",
    purpose: "VPC_PEERING",
    addressType: "INTERNAL",
    prefixLength: 16,
    network: network.id,
  },
  { dependsOn: [network] }
);

// allows google public internet services to connect at a private network
const privateVpcConnection = new gcp.servicenetworking.Connection(
  `${stack}-private-vpc-connection`,
  {
    network: network.id,
    service: "servicenetworking.googleapis.com",
    reservedPeeringRanges: [privateIpAddress.name],
    deletionPolicy: "ABANDON",
  },
  { dependsOn: [network, privateIpAddress] }
);

// Define the ip interval
const subnetwork = new gcp.compute.Subnetwork(
  `${stack}-sub-network`,
  {
    name: `${stack}-subnetwork`,
    ipCidrRange: "10.1.0.0/28",
    network: network.selfLink,
  },
  { dependsOn: [network, privateVpcConnection, privateIpAddress] }
);

// Allow serverless services to connect to resources into the VPC
const networkConnector = new gcp.vpcaccess.Connector(
  `${stack}-connector`,
  {
    name: stack,
    subnet: {
      name: subnetwork.name,
    },
    minInstances: 3,
    maxInstances: 5,
  },
  { dependsOn: [subnetwork] }
);

// outbound ip to access internet
const address = new gcp.compute.Address(`${stack}-address`, {
  name: `${stack}-outbound-static-ip-address`,
});

// manage the routes
const router = new gcp.compute.Router(
  `${stack}-router`,
  {
    name: `${stack}-router`,
    network: network.selfLink,
  },
  { dependsOn: [network, privateIpAddress] }
);

// allow private services to access internet in a VPC
const routerNat = new gcp.compute.RouterNat(
  `${stack}-router-nat`,
  {
    name: `${stack}-router-nat`,
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

export {
  network,
  subnetwork,
  networkConnector,
  routerNat,
  address,
  privateVpcConnection,
};
