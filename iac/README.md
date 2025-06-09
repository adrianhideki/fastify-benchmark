Logged into `gs://dev-pulumi-hdk`.

To run the pulumi command use:

```sh
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json pulumi preview
```

Github actions envs:
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