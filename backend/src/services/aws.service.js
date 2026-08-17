const {
  EC2Client,
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
} = require("@aws-sdk/client-ec2");
const {
  S3Client,
  ListBucketsCommand,
  GetBucketAclCommand,
  GetBucketEncryptionCommand,
  GetBucketPublicAccessBlockCommand,
} = require("@aws-sdk/client-s3");
const {
  IAMClient,
  ListUsersCommand,
  ListPoliciesCommand,
  GetAccountSummaryCommand,
  ListMFADevicesCommand,
} = require("@aws-sdk/client-iam");
const {
  RDSClient,
  DescribeDBInstancesCommand,
} = require("@aws-sdk/client-rds");
const {
  STSClient,
  GetCallerIdentityCommand,
} = require("@aws-sdk/client-sts");

class AWSService {
  constructor(credentials) {
    this.credentials = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    };
    this.region = credentials.region || "us-east-1";
    this.stsClient = new STSClient({ credentials: this.credentials, region: this.region });
  }

  async getAccountId() {
    const identity = await this.stsClient.send(new GetCallerIdentityCommand({}));
    return identity.Account;
  }

  async scanAll() {
    const resources = [];
    const findings = [];

    const ec2Results = await this.scanEC2();
    resources.push(...ec2Results.resources);
    findings.push(...ec2Results.findings);

    const s3Results = await this.scanS3();
    resources.push(...s3Results.resources);
    findings.push(...s3Results.findings);

    const iamResults = await this.scanIAM();
    resources.push(...iamResults.resources);
    findings.push(...iamResults.findings);

    const rdsResults = await this.scanRDS();
    resources.push(...rdsResults.resources);
    findings.push(...rdsResults.findings);

    const sgResults = await this.scanSecurityGroups();
    resources.push(...sgResults.resources);
    findings.push(...sgResults.findings);

    return { resources, findings };
  }

  async scanEC2() {
    const client = new EC2Client({ credentials: this.credentials, region: this.region });
    const resources = [];
    const findings = [];

    try {
      const response = await client.send(new DescribeInstancesCommand({}));
      for (const reservation of response.Reservations || []) {
        for (const instance of reservation.Instances) {
          const tags = {};
          (instance.Tags || []).forEach((t) => (tags[t.Key] = t.Value));
          const name = tags.Name || instance.InstanceId;

          resources.push({
            awsId: instance.InstanceId,
            service: "EC2",
            name,
            region: this.region,
            resourceType: instance.InstanceType,
            ARN: `arn:aws:ec2:${this.region}:${instance.AccountId || "unknown"}:instance/${instance.InstanceId}`,
            isPublic: !!instance.PublicIpAddress,
            metadata: {
              state: instance.State?.Name,
              type: instance.InstanceType,
              publicIp: instance.PublicIpAddress,
              privateIp: instance.PrivateIpAddress,
              launchTime: instance.LaunchTime,
            },
          });

          if (instance.PublicIpAddress) {
            findings.push({
              service: "EC2",
              title: "EC2 instance with public IP",
              description: `${name} (${instance.InstanceId}) has a public IP address: ${instance.PublicIpAddress}`,
              severity: "MEDIUM",
              remediation: "Review if public IP is necessary. Consider using a bastion host or VPN.",
              resourceAwsId: instance.InstanceId,
            });
          }

          if (!instance.RootDeviceType || instance.RootDeviceType !== "ebs") continue;
          const volAttachment = instance.BlockDeviceMappings?.[0];
          if (volAttachment && !tags.Encrypted) {
            findings.push({
              service: "EC2",
              title: "EC2 EBS volume may lack encryption",
              description: `Root volume of ${name} may not be encrypted`,
              severity: "LOW",
              remediation: "Enable EBS encryption at rest for sensitive workloads.",
              resourceAwsId: instance.InstanceId,
            });
          }
        }
      }
    } catch (err) {
      findings.push({
        service: "EC2",
        title: "EC2 scan error",
        description: err.message,
        severity: "INFORMATIONAL",
      });
    }

    return { resources, findings };
  }

  async scanS3() {
    const client = new S3Client({ credentials: this.credentials, region: this.region });
    const resources = [];
    const findings = [];

    try {
      const response = await client.send(new ListBucketsCommand({}));

      for (const bucket of response.Buckets || []) {
        let isPublic = false;
        let isEncrypted = false;

        try {
          const pubAccess = await client.send(
            new GetBucketPublicAccessBlockCommand({ Bucket: bucket.Name })
          );
          const block = pubAccess.PublicAccessBlockConfiguration;
          isPublic =
            !block?.BlockPublicAcls ||
            !block?.IgnorePublicAcls ||
            !block?.BlockPublicPolicy ||
            !block?.RestrictPublicBuckets;
        } catch {
          isPublic = true;
        }

        try {
          await client.send(new GetBucketEncryptionCommand({ Bucket: bucket.Name }));
          isEncrypted = true;
        } catch {
          isEncrypted = false;
        }

        resources.push({
          awsId: bucket.Name,
          service: "S3",
          name: bucket.Name,
          region: this.region,
          resourceType: "S3Bucket",
          ARN: `arn:aws:s3:::${bucket.Name}`,
          isPublic,
          isEncrypted,
          metadata: { createdAt: bucket.CreationDate },
        });

        if (isPublic) {
          findings.push({
            service: "S3",
            title: "Public S3 bucket",
            description: `Bucket "${bucket.Name}" has public access enabled`,
            severity: "CRITICAL",
            remediation: "Enable S3 Block Public Access settings and review bucket policies.",
            resourceAwsId: bucket.Name,
          });
        }

        if (!isEncrypted) {
          findings.push({
            service: "S3",
            title: "Unencrypted S3 bucket",
            description: `Bucket "${bucket.Name}" does not have default encryption enabled`,
            severity: "HIGH",
            remediation: "Enable default encryption using SSE-S3 or SSE-KMS.",
            resourceAwsId: bucket.Name,
          });
        }
      }
    } catch (err) {
      findings.push({
        service: "S3",
        title: "S3 scan error",
        description: err.message,
        severity: "INFORMATIONAL",
      });
    }

    return { resources, findings };
  }

  async scanIAM() {
    const client = new IAMClient({ credentials: this.credentials, region: this.region });
    const resources = [];
    const findings = [];

    try {
      const accountSummary = await client.send(new GetAccountSummaryCommand({}));
      const summary = accountSummary.SummaryMap || {};

      resources.push({
        awsId: "iam-account",
        service: "IAM",
        name: "IAM Account Summary",
        region: this.region,
        resourceType: "IAMAccount",
        metadata: {
          users: summary.Users || 0,
          groups: summary.Groups || 0,
          roles: summary.Roles || 0,
          policies: summary.Policies || 0,
        },
      });

      if (summary.AccountMFAEnabled !== 1) {
        findings.push({
          service: "IAM",
          title: "Root account MFA not enabled",
          description: "The AWS account root user does not have MFA enabled",
          severity: "CRITICAL",
          remediation: "Enable MFA for the root account immediately.",
        });
      }

      if (summary.AccountAccessKeysPresent === 1) {
        findings.push({
          service: "IAM",
          title: "Root account has access keys",
          description: "The root account has active access keys",
          severity: "CRITICAL",
          remediation: "Remove root access keys and use IAM users instead.",
        });
      }

      const usersResponse = await client.send(new ListUsersCommand({}));
      for (const user of usersResponse.Users || []) {
        resources.push({
          awsId: user.UserId,
          service: "IAM",
          name: user.UserName,
          region: this.region,
          resourceType: "IAMUser",
          ARN: user.Arn,
          metadata: {
            created: user.CreateDate,
            lastUsed: user.PasswordLastUsed,
          },
        });

        try {
          const mfaDevices = await client.send(
            new ListMFADevicesCommand({ UserName: user.UserName })
          );
          if ((mfaDevices.MFADevices || []).length === 0) {
            findings.push({
              service: "IAM",
              title: "IAM user without MFA",
              description: `User "${user.UserName}" does not have MFA enabled`,
              severity: "HIGH",
              remediation: "Enable MFA for all IAM users.",
              resourceAwsId: user.UserId,
            });
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      findings.push({
        service: "IAM",
        title: "IAM scan error",
        description: err.message,
        severity: "INFORMATIONAL",
      });
    }

    return { resources, findings };
  }

  async scanRDS() {
    const client = new RDSClient({ credentials: this.credentials, region: this.region });
    const resources = [];
    const findings = [];

    try {
      const response = await client.send(new DescribeDBInstancesCommand({}));

      for (const db of response.DBInstances || []) {
        const isPublic = db.PubliclyAccessible;
        const isEncrypted = db.StorageEncrypted;

        resources.push({
          awsId: db.DBInstanceIdentifier,
          service: "RDS",
          name: db.DBInstanceIdentifier,
          region: this.region,
          resourceType: db.DBInstanceClass,
          ARN: db.DBInstanceArn,
          isPublic,
          isEncrypted,
          metadata: {
            engine: db.Engine,
            engineVersion: db.EngineVersion,
            status: db.DBInstanceStatus,
            multiAZ: db.MultiAZ,
          },
        });

        if (isPublic) {
          findings.push({
            service: "RDS",
            title: "Publicly accessible RDS instance",
            description: `RDS instance "${db.DBInstanceIdentifier}" is publicly accessible`,
            severity: "CRITICAL",
            remediation: "Disable public accessibility for RDS instances.",
            resourceAwsId: db.DBInstanceIdentifier,
          });
        }

        if (!isEncrypted) {
          findings.push({
            service: "RDS",
            title: "Unencrypted RDS instance",
            description: `RDS instance "${db.DBInstanceIdentifier}" does not have encryption at rest enabled`,
            severity: "HIGH",
            remediation: "Enable storage encryption for RDS instances.",
            resourceAwsId: db.DBInstanceIdentifier,
          });
        }
      }
    } catch (err) {
      if (err.name !== "AuthorizationError") {
        findings.push({
          service: "RDS",
          title: "RDS scan error",
          description: err.message,
          severity: "INFORMATIONAL",
        });
      }
    }

    return { resources, findings };
  }

  async scanSecurityGroups() {
    const client = new EC2Client({ credentials: this.credentials, region: this.region });
    const resources = [];
    const findings = [];

    try {
      const response = await client.send(new DescribeSecurityGroupsCommand({}));

      for (const sg of response.SecurityGroups || []) {
        const openPorts = [];
        for (const rule of sg.IpPermissions || []) {
          for (const ipRange of rule.IpRanges || []) {
            if (ipRange.CidrIp === "0.0.0.0/0") {
              openPorts.push({
                from: rule.FromPort,
                to: rule.ToPort,
                protocol: rule.IpProtocol,
              });
            }
          }
        }

        resources.push({
          awsId: sg.GroupId,
          service: "EC2",
          name: sg.GroupName,
          region: this.region,
          resourceType: "SecurityGroup",
          ARN: `arn:aws:ec2:${this.region}:${sg.OwnerId}:security-group/${sg.GroupId}`,
          isPublic: openPorts.length > 0,
          metadata: { description: sg.Description, vpcId: sg.VpcId },
        });

        for (const port of openPorts) {
          const isSSH = port.from === 22 || port.to === 22;
          const isRDP = port.from === 3389 || port.to === 3389;
          const severity = isSSH || isRDP ? "CRITICAL" : "HIGH";

          findings.push({
            service: "EC2",
            title: `Security group ${isSSH ? "open SSH" : isRDP ? "open RDP" : "open port"} to internet`,
            description: `${sg.GroupName} (${sg.GroupId}) allows ${port.protocol}:${port.from === -1 ? "*" : port.from}-${port.to === -1 ? "*" : port.to} from 0.0.0.0/0`,
            severity,
            remediation: `Restrict access to port ${port.from} to known IP ranges only.`,
            resourceAwsId: sg.GroupId,
          });
        }
      }
    } catch (err) {
      findings.push({
        service: "EC2",
        title: "Security group scan error",
        description: err.message,
        severity: "INFORMATIONAL",
      });
    }

    return { resources, findings };
  }
}

module.exports = AWSService;
