import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const prefix = config.require("name-prefix");

const artifactoryRegistry = new gcp.artifactregistry.Repository(
  `${prefix}-registry`,
  {
    repositoryId: `${prefix}-repository`,
    description: "Docker Repository",
    format: "DOCKER",
    cleanupPolicies: [
      {
        id: "delete-untagged",
        action: "DELETE",
        condition: {
          tagState: "UNTAGGED",
        },
      },
      {
        id: "keep-new-untagged",
        action: "KEEP",
        condition: {
          tagState: "UNTAGGED",
          newerThan: "7d",
        },
      },
    ],
  }
);

export { artifactoryRegistry };
