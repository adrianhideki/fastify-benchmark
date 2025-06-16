import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { sqlInstance, userPassword } from "./database";

const config = new pulumi.Config();
const stack = pulumi.getStack();
const databaseName = config.require("databaseName");
const databaseSchema = config.require("databaseSchema");
const projectNumber = config.require("projectNumber");

const databaseUrlSecret = new gcp.secretmanager.Secret(
  `${stack}-database-url-secret`,
  {
    secretId: `${stack}-database-url-secret`,
    replication: { auto: {} },
  }
);

const sqlUserPasswordSecret = new gcp.secretmanager.Secret(
  `${stack}-sql-user-password-secret`,
  {
    secretId: `${stack}-sql-user-password-secret`,
    replication: { auto: {} },
  }
);

const databaseUrlSecretVersion = new gcp.secretmanager.SecretVersion(
  `${stack}-database-url-secret-version`,
  {
    secret: databaseUrlSecret.id,
    secretData: userPassword.result.apply(
      (v) =>
        pulumi.interpolate`postgresql://${stack}-user:${encodeURIComponent(
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
  `${stack}-sql-user-password-secret`,
  {
    secret: sqlUserPasswordSecret.id,
    secretData: userPassword.result,
  },
  {
    dependsOn: [sqlUserPasswordSecret],
  }
);

const databaseUlrSecretAccess = new gcp.secretmanager.SecretIamMember(
  `${stack}-db-password-access`,
  {
    project: gcp.config.project,
    secretId: databaseUrlSecretVersion.id,
    role: "roles/secretmanager.secretAccessor",
    member: pulumi.interpolate`serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`,
  },
  {
    deleteBeforeReplace: true,
    replaceOnChanges: [],
      dependsOn: [databaseUrlSecretVersion],
  }
);

const sqlUserPasswordSecretSecreteAccess =
  new gcp.secretmanager.SecretIamMember(
    `${stack}-sql-user-password-access`,
    {
      project: gcp.config.project,
      secretId: sqlUserPasswordSecret.id,
      role: "roles/secretmanager.secretAccessor",
      member: pulumi.interpolate`serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`,
    },
    {
      deleteBeforeReplace: true,
      replaceOnChanges: [],
      dependsOn: [sqlUserPasswordSecret],
    }
  );

export {
  databaseUrlSecret,
  sqlUserPasswordSecretSecreteAccess,
  databaseUlrSecretAccess,
  sqlUserPasswordSecretVersion,
  sqlUserPasswordSecret,
};
