import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { sqlInstance, userPassword } from "./database";

const config = new pulumi.Config();
const prefix = config.require("name-prefix");
const databaseName = config.require("databaseName");
const databaseSchema = config.require("databaseSchema");
const projectNumber = config.require("projectNumber");

const databaseUrlSecret = new gcp.secretmanager.Secret(
  `${prefix}-database-url-secret`,
  {
    secretId: `${prefix}-database-url-secret`,
    replication: { auto: {} },
  }
);

const sqlUserPasswordSecret = new gcp.secretmanager.Secret(
  `${prefix}-sql-user-password-secret`,
  {
    secretId: `${prefix}-sql-user-password-secret`,
    replication: { auto: {} },
  }
);

const databaseUrlSecretVersion = new gcp.secretmanager.SecretVersion(
  `${prefix}-database-url-secret-version`,
  {
    secret: databaseUrlSecret.id,
    secretData: userPassword.result.apply(
      (v) =>
        pulumi.interpolate`postgresql://${prefix}-user:${encodeURIComponent(
          v
        )}@${
          sqlInstance.privateIpAddress
        }:5432/${databaseName}?schema=${databaseSchema}`
    ),
  },
  {
    dependsOn: [databaseUrlSecret, sqlInstance],
  }
);

const sqlUserPasswordSecretVersion = new gcp.secretmanager.SecretVersion(
  `${prefix}-sql-user-password-secret`,
  {
    secret: sqlUserPasswordSecret.id,
    secretData: userPassword.result,
  },
  {
    dependsOn: [sqlUserPasswordSecret],
  }
);

const secretAccess = new gcp.secretmanager.SecretIamMember(
  `${prefix}-db-password-access`,
  {
    project: gcp.config.project,
    secretId: databaseUrlSecretVersion.id,
    role: "roles/secretmanager.secretAccessor",
    member: pulumi.interpolate`serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`,
  },
  {
    deleteBeforeReplace: true,
  }
);

export { databaseUrlSecret, secretAccess };
