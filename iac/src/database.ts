import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { network, subnetwork, privateVpcConnection } from "./network";

const config = new pulumi.Config();
const dbPassword = config.require("dbPassword");
const prefix = config.require("name-prefix");

const database = new gcp.sql.DatabaseInstance(
  `${prefix}-database`,
  {
    name: `${prefix}-database`,
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

export { database };
