# AWS Infrastructure Setup Guide

This guide explains how to use the `scripts/setup_aws_infra.sh` script to automatically create your AWS RDS database and configure the necessary security groups.

## Prerequisites

1.  **AWS CLI Installed**: You must have the AWS CLI installed on your machine.
    - [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2.  **AWS Configured**: Run `aws configure` to set your credentials and default region.
    - **Permissions Required**: The IAM User you use must have the following AWS Managed Policies (or equivalent permissions):
        - `AmazonRDSFullAccess` (to create and manage the database)
        - `AmazonEC2FullAccess` (to create security groups and query VPCs)
    
    ```bash
    aws configure
    ```
    - **AWS Access Key ID**: Your access key.
    - **AWS Secret Access Key**: Your secret key.
    - **Default region name**: e.g., `us-east-1` (or your preferred region).
    - **Default output format**: `json`.

## Usage

1.  **Run the Script**:
    Navigate to the project root and run:
    ```bash
    ./scripts/setup_aws_infra.sh
    ```

2.  **Enter Password**:
    The script will prompt you to enter a secure password for the database master user (`postgres`).

3.  **Wait for Completion**:
    - The script will create a Security Group (`algolindo-db-sg`) if it doesn't exist.
    - It will create a PostgreSQL RDS instance (`algolindo-db`).
    - **Note**: Creation can take 5-10 minutes. The script will wait until the database is available.

4.  **Get Output**:
    Once finished, the script will output the connection details:
    ```
    RDS Endpoint: algolindo-db.xxxxxx.us-east-1.rds.amazonaws.com
    DB Name:      algolindo
    Username:     postgres
    Port:         5432
    ```

## Post-Setup

Use the output values to configure your EC2 deployment environments.

### For `deploy.sh`:
You can export these variables before running the deployment script on your EC2 instance (or add them to `~/.bashrc` on the server).

```bash
export RDS_HOSTNAME='your-new-endpoint.amazonaws.com'
export RDS_DB_NAME='algolindo'
export RDS_USERNAME='postgres'
export RDS_PASSWORD='your-password'
export RDS_PORT='5432'
```

### Security Note
The script currently opens port 5432 to `0.0.0.0/0` (the world) to ensure you can connect. **For production security**:
1.  Go to the AWS Console -> VPC -> Security Groups.
2.  Find `algolindo-db-sg`.
3.  Edit Inbound Rules.
4.  Change the source for Port 5432 from `0.0.0.0/0` to the Security Group ID of your EC2 instance (e.g., `sg-xxxxx`).
