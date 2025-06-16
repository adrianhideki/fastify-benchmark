import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";
import { network, subnetwork, privateVpcConnection } from "./network";

const config = new pulumi.Config();
const databaseName = config.require("databaseName");
const stack = pulumi.getStack();

const databasePassword = new random.RandomPassword(`${stack}-root-password`, {
  length: 16,
  special: false,
});

const userPassword = new random.RandomPassword(`${stack}-user-password`, {
  length: 16,
  special: false,
});

const sqlInstance = new gcp.sql.DatabaseInstance(
  `${stack}-database`,
  {
    name: `${stack}-database`,
    databaseVersion: "POSTGRES_15",
    region: "us-central1",
    deletionProtection: false,
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
    rootPassword: databasePassword.result,
  },
  { dependsOn: [network, subnetwork, privateVpcConnection] }
);

const database = new gcp.sql.Database(
  `${stack}-database`,
  {
    name: databaseName,
    instance: sqlInstance.name,
    deletionPolicy: "ABANDON",
  },
  {
    dependsOn: [sqlInstance],
  }
);

const user = new gcp.sql.User(
  `${stack}-user`,
  {
    name: `${stack}-user`,
    instance: sqlInstance.name,
    password: userPassword.result,
    deletionPolicy: "ABANDON",
  },
  {
    dependsOn: [sqlInstance],
  }
);

export { sqlInstance, database, databasePassword, userPassword, user };
