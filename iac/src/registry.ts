import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const stack = pulumi.getStack();

const artifactoryRegistry = new gcp.artifactregistry.Repository(
  `${stack}-registry`,
  {
    repositoryId: `${stack}-repository`,
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
