# Pulumi IaC

This folder has the purpose to provide all the infrastructure for this API using GCP.

## Setup

Install the nodejs dependencies:

```sh
npm i
```

## Auth

Generate a [credentials JSON](https://developers.google.com/workspace/guides/create-credentials?hl=pt-br#service-account) from a service account from google and save at IaC folder with the name `credentials.json`.

## Login with pulumi

Pulumi uses a file store to save stack actual state, for this use the command bellow to login to a GCP bucket and save data remotely (for more info see [pulumi login](https://www.pulumi.com/docs/iac/cli/commands/pulumi_login/)):

```
npm run login gs://dev-pulumi-hdk
```

## Install the GCP SDK

Install the GCP SDK [here](https://cloud.google.com/sdk/docs/install) and run the following commands to be able to run the docker build and push to Artifact Registry:

```sh
gcloud auth login
gcloud config set project $PROJECT
gcloud auth configure-docker $REGION-docker.pkg.dev
```

## Preview and create infrastructure

To preview the resources creation / modification / deletion run:

```sh
npm run pre
```

To run the resources iterations execute:

```sh
npm run up
```

## Configure environment for github

In github create a environment with the same name as the stack and configure the following environments and secrets:

```env
# secrets
DATABASE_URL=
GOOGLE_APPLICATION_CREDENTIALS=google_credentials_json_content
PULUMI_CONFIG_PASSPHRASE=pulumi_stack_password

#variables
CLOUD_URL=gs://dev-pulumi-hdk
DATABASE_NAME=name_of_database_instance
GCP_REGION=gcp_region_name
NAME_PREFIX=stack_name_prefix
PROJECT_ID=gcp_project_id
PULUMI_STACK=pulumi_stack_name
```
