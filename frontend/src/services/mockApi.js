const DEMO_USER = { id: "demo-1", email: "admin@cspm-demo.com", name: "Security Admin" };
const TOKEN = "demo-token-cspm-2024";

const mockResources = [
  { id: "r1", awsId: "i-0abc123def456789", service: "EC2", name: "web-server-prod", region: "us-east-1", resourceType: "t3.medium", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0abc123def456789", isPublic: true, isEncrypted: false, complianceTags: "[]", riskScore: 8.5, lastUpdated: new Date().toISOString(), metadata: { state: "running", type: "t3.medium", publicIp: "52.14.22.100" } },
  { id: "r2", awsId: "i-0def456ghi789012", service: "EC2", name: "api-server-staging", region: "us-east-1", resourceType: "t3.large", arn: "arn:aws:ec2:us-east-1:123456789012:instance/i-0def456ghi789012", isPublic: false, isEncrypted: true, complianceTags: "[]", riskScore: 2.1, lastUpdated: new Date().toISOString(), metadata: { state: "running" } },
  { id: "r3", awsId: "i-0ghi789jkl012345", service: "EC2", name: "worker-node", region: "us-west-2", resourceType: "c5.xlarge", arn: "arn:aws:ec2:us-west-2:123456789012:instance/i-0ghi789jkl012345", isPublic: false, isEncrypted: true, complianceTags: "[]", riskScore: 1.5, lastUpdated: new Date().toISOString(), metadata: { state: "running" } },
  { id: "r4", awsId: "my-company-assets", service: "S3", name: "my-company-assets", region: "us-east-1", resourceType: "S3Bucket", arn: "arn:aws:s3:::my-company-assets", isPublic: true, isEncrypted: false, complianceTags: "[]", riskScore: 9.2, lastUpdated: new Date().toISOString(), metadata: {} },
  { id: "r5", awsId: "backup-data-2024", service: "S3", name: "backup-data-2024", region: "us-east-1", resourceType: "S3Bucket", arn: "arn:aws:s3:::backup-data-2024", isPublic: false, isEncrypted: true, complianceTags: "[]", riskScore: 1.0, lastUpdated: new Date().toISOString(), metadata: {} },
  { id: "r6", awsId: "prod-db-logs", service: "S3", name: "prod-db-logs", region: "eu-west-1", resourceType: "S3Bucket", arn: "arn:aws:s3:::prod-db-logs", isPublic: false, isEncrypted: false, complianceTags: "[]", riskScore: 6.0, lastUpdated: new Date().toISOString(), metadata: {} },
  { id: "r7", awsId: "AIDAXXXXXXXXXXXXXXXXX", service: "IAM", name: "admin-user", region: "global", resourceType: "IAMUser", arn: "arn:aws:iam::123456789012:user/admin-user", isPublic: false, isEncrypted: null, complianceTags: "[]", riskScore: 5.0, lastUpdated: new Date().toISOString(), metadata: { created: "2023-01-15", lastUsed: "2024-12-01" } },
  { id: "r8", awsId: "AIDAYYYYYYYYYYYYYYYYY", service: "IAM", name: "ci-cd-deployer", region: "global", resourceType: "IAMUser", arn: "arn:aws:iam::123456789012:user/ci-cd-deployer", isPublic: false, isEncrypted: null, complianceTags: "[]", riskScore: 3.0, lastUpdated: new Date().toISOString(), metadata: { created: "2024-03-10" } },
  { id: "r9", awsId: "iam-account", service: "IAM", name: "IAM Account Summary", region: "global", resourceType: "IAMAccount", arn: null, isPublic: false, isEncrypted: null, complianceTags: "[]", riskScore: 4.0, lastUpdated: new Date().toISOString(), metadata: { users: 5, groups: 2, roles: 12, policies: 18 } },
  { id: "r10", awsId: "prod-mysql-primary", service: "RDS", name: "prod-mysql-primary", region: "us-east-1", resourceType: "db.r5.large", arn: "arn:aws:rds:us-east-1:123456789012:db:prod-mysql-primary", isPublic: true, isEncrypted: false, complianceTags: "[]", riskScore: 9.8, lastUpdated: new Date().toISOString(), metadata: { engine: "mysql", engineVersion: "8.0.35", status: "available", multiAZ: true } },
  { id: "r11", awsId: "analytics-postgres", service: "RDS", name: "analytics-postgres", region: "eu-west-1", resourceType: "db.t3.medium", arn: "arn:aws:rds:eu-west-1:123456789012:db:analytics-postgres", isPublic: false, isEncrypted: true, complianceTags: "[]", riskScore: 1.2, lastUpdated: new Date().toISOString(), metadata: { engine: "postgres", status: "available" } },
  { id: "r12", awsId: "sg-0abc111111", service: "EC2", name: "web-facing-sg", region: "us-east-1", resourceType: "SecurityGroup", arn: "arn:aws:ec2:us-east-1:123456789012:security-group/sg-0abc111111", isPublic: true, isEncrypted: null, complianceTags: "[]", riskScore: 9.0, lastUpdated: new Date().toISOString(), metadata: { description: "Web-facing security group", vpcId: "vpc-0abc123" } },
  { id: "r13", awsId: "sg-0def222222", service: "EC2", name: "internal-app-sg", region: "us-east-1", resourceType: "SecurityGroup", arn: "arn:aws:ec2:us-east-1:123456789012:security-group/sg-0def222222", isPublic: false, isEncrypted: null, complianceTags: "[]", riskScore: 2.0, lastUpdated: new Date().toISOString(), metadata: { description: "Internal app traffic" } },
];

const mockFindings = [
  { id: "f1", scanId: "s1", resourceId: "r1", service: "EC2", title: "EC2 instance with public IP", description: "web-server-prod (i-0abc123def456789) has a public IP address: 52.14.22.100", severity: "MEDIUM", status: "OPEN", remediation: "Review if public IP is necessary. Consider using a bastion host or VPN.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "i-0abc123def456789", name: "web-server-prod", service: "EC2" } },
  { id: "f2", scanId: "s1", resourceId: "r1", service: "EC2", title: "EC2 EBS volume may lack encryption", description: "Root volume of web-server-prod may not be encrypted", severity: "LOW", status: "OPEN", remediation: "Enable EBS encryption at rest for sensitive workloads.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "i-0abc123def456789", name: "web-server-prod", service: "EC2" } },
  { id: "f3", scanId: "s1", resourceId: "r4", service: "S3", title: "Public S3 bucket", description: 'Bucket "my-company-assets" has public access enabled', severity: "CRITICAL", status: "OPEN", remediation: "Enable S3 Block Public Access settings and review bucket policies.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "my-company-assets", name: "my-company-assets", service: "S3" } },
  { id: "f4", scanId: "s1", resourceId: "r4", service: "S3", title: "Unencrypted S3 bucket", description: 'Bucket "my-company-assets" does not have default encryption enabled', severity: "HIGH", status: "OPEN", remediation: "Enable default encryption using SSE-S3 or SSE-KMS.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "my-company-assets", name: "my-company-assets", service: "S3" } },
  { id: "f5", scanId: "s1", resourceId: "r6", service: "S3", title: "Unencrypted S3 bucket", description: 'Bucket "prod-db-logs" does not have default encryption enabled', severity: "HIGH", status: "OPEN", remediation: "Enable default encryption using SSE-S3 or SSE-KMS.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "prod-db-logs", name: "prod-db-logs", service: "S3" } },
  { id: "f6", scanId: "s1", resourceId: "r7", service: "IAM", title: "IAM user without MFA", description: 'User "admin-user" does not have MFA enabled', severity: "HIGH", status: "OPEN", remediation: "Enable MFA for all IAM users.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "AIDAXXXXXXXXXXXXXXXXX", name: "admin-user", service: "IAM" } },
  { id: "f7", scanId: "s1", resourceId: "r9", service: "IAM", title: "Root account MFA not enabled", description: "The AWS account root user does not have MFA enabled", severity: "CRITICAL", status: "OPEN", remediation: "Enable MFA for the root account immediately.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: null },
  { id: "f8", scanId: "s1", resourceId: "r10", service: "RDS", title: "Publicly accessible RDS instance", description: 'RDS instance "prod-mysql-primary" is publicly accessible', severity: "CRITICAL", status: "OPEN", remediation: "Disable public accessibility for RDS instances.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "prod-mysql-primary", name: "prod-mysql-primary", service: "RDS" } },
  { id: "f9", scanId: "s1", resourceId: "r10", service: "RDS", title: "Unencrypted RDS instance", description: 'RDS instance "prod-mysql-primary" does not have encryption at rest enabled', severity: "HIGH", status: "OPEN", remediation: "Enable storage encryption for RDS instances.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "prod-mysql-primary", name: "prod-mysql-primary", service: "RDS" } },
  { id: "f10", scanId: "s1", resourceId: "r12", service: "EC2", title: "Security group open SSH to internet", description: "web-facing-sg (sg-0abc111111) allows tcp:22-22 from 0.0.0.0/0", severity: "CRITICAL", status: "OPEN", remediation: "Restrict access to port 22 to known IP ranges only.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "sg-0abc111111", name: "web-facing-sg", service: "EC2" } },
  { id: "f11", scanId: "s1", resourceId: "r12", service: "EC2", title: "Security group open RDP to internet", description: "web-facing-sg (sg-0abc111111) allows tcp:3389-3389 from 0.0.0.0/0", severity: "CRITICAL", status: "OPEN", remediation: "Restrict access to port 3389 to known IP ranges only.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "sg-0abc111111", name: "web-facing-sg", service: "EC2" } },
  { id: "f12", scanId: "s1", resourceId: "r12", service: "EC2", title: "Security group open port to internet", description: "web-facing-sg (sg-0abc111111) allows tcp:443-443 from 0.0.0.0/0", severity: "HIGH", status: "OPEN", remediation: "Restrict access to port 443 to known IP ranges only.", firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), resource: { awsId: "sg-0abc111111", name: "web-facing-sg", service: "EC2" } },
];

const mockScans = [
  { id: "s1", userId: "demo-1", credentialId: "c1", status: "COMPLETED", startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date().toISOString(), resourcesFound: 13, findingsCount: 12, criticalCount: 5, highCount: 4, mediumCount: 1, lowCount: 2, complianceScore: 38, credential: { label: "Production AWS Account" } },
  { id: "s2", userId: "demo-1", credentialId: "c1", status: "COMPLETED", startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86400000 + 120000).toISOString(), resourcesFound: 12, findingsCount: 10, criticalCount: 3, highCount: 4, mediumCount: 2, lowCount: 1, complianceScore: 45, credential: { label: "Production AWS Account" } },
  { id: "s3", userId: "demo-1", credentialId: "c1", status: "COMPLETED", startedAt: new Date(Date.now() - 172800000).toISOString(), completedAt: new Date(Date.now() - 172800000 + 90000).toISOString(), resourcesFound: 11, findingsCount: 14, criticalCount: 6, highCount: 5, mediumCount: 2, lowCount: 1, complianceScore: 32, credential: { label: "Production AWS Account" } },
];

const mockAlerts = [
  { id: "a1", userId: "demo-1", scanId: "s1", title: "Scan completed: 5 critical, 4 high findings", message: "Found 12 security issues across 13 resources", severity: "CRITICAL", isRead: false, createdAt: new Date().toISOString() },
  { id: "a2", userId: "demo-1", scanId: "s1", title: "Public S3 bucket detected", message: 'Bucket "my-company-assets" has public access enabled', severity: "CRITICAL", isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "a3", userId: "demo-1", scanId: "s1", title: "RDS publicly accessible", message: 'RDS instance "prod-mysql-primary" is publicly accessible', severity: "CRITICAL", isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "a4", userId: "demo-1", scanId: "s1", title: "SSH open to internet", message: "Security group web-facing-sg allows SSH from 0.0.0.0/0", severity: "HIGH", isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "a5", userId: "demo-1", title: "MFA not enabled on admin user", message: 'User "admin-user" does not have MFA configured', severity: "HIGH", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

class MockStorage {
  constructor() {
    this.load();
  }
  load() {
    try {
      const d = JSON.parse(localStorage.getItem("cspm_demo_data") || "null");
      this.data = d || { resources: mockResources, findings: mockFindings, scans: mockScans, alerts: mockAlerts, credentials: [{ id: "c1", label: "Production AWS Account", accessKeyId: "AKIA****", region: "us-east-1", accountNumber: "123456789012", isActive: true, lastScannedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 2592000000).toISOString() }] };
    } catch {
      this.data = { resources: mockResources, findings: mockFindings, scans: mockScans, alerts: mockAlerts, credentials: [{ id: "c1", label: "Production AWS Account", accessKeyId: "AKIA****", region: "us-east-1", accountNumber: "123456789012", isActive: true, lastScannedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 2592000000).toISOString() }] };
    }
  }
  save() { localStorage.setItem("cspm_demo_data", JSON.stringify(this.data)); }
  reset() { localStorage.removeItem("cspm_demo_data"); this.load(); }
}

const store = new MockStorage();

function mockResponse(data, status = 200) {
  return Promise.resolve({ data, status, headers: {}, config: {} });
}

function mockError(message, status = 400) {
  return Promise.reject({ response: { data: { error: message }, status }, message });
}

export const authAPI = {
  login: async ({ email, password }) => {
    await delay(500);
    if (!email || !password) return mockError("Email and password required");
    const user = { ...DEMO_USER, email };
    localStorage.setItem("cspm_token", TOKEN);
    localStorage.setItem("cspm_user", JSON.stringify(user));
    return mockResponse({ user, token: TOKEN });
  },
  register: async ({ email, password, name }) => {
    await delay(500);
    const user = { id: "demo-1", email, name: name || "Demo User" };
    localStorage.setItem("cspm_token", TOKEN);
    localStorage.setItem("cspm_user", JSON.stringify(user));
    return mockResponse({ user, token: TOKEN });
  },
  me: async () => {
    await delay(200);
    const user = JSON.parse(localStorage.getItem("cspm_user") || "null");
    if (!user) return mockError("Not authenticated", 401);
    return mockResponse(user);
  },
};

export const awsAPI = {
  getCredentials: async () => {
    await delay(300);
    return mockResponse(store.data.credentials);
  },
  addCredential: async (data) => {
    await delay(500);
    const cred = { id: "c" + Date.now(), ...data, accessKeyId: data.accessKeyId.slice(0, 6) + "****", isActive: true, createdAt: new Date().toISOString() };
    store.data.credentials.push(cred);
    store.save();
    return mockResponse(cred);
  },
  deleteCredential: async (id) => {
    await delay(300);
    store.data.credentials = store.data.credentials.filter((c) => c.id !== id);
    store.save();
    return mockResponse({ message: "Deleted" });
  },
};

export const scanAPI = {
  run: async ({ credentialId }) => {
    await delay(800);
    const scan = {
      id: "s" + Date.now(),
      userId: "demo-1",
      credentialId,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 120000).toISOString(),
      completedAt: new Date().toISOString(),
      resourcesFound: store.data.resources.length,
      findingsCount: store.data.findings.length,
      criticalCount: 5,
      highCount: 4,
      mediumCount: 1,
      lowCount: 2,
      complianceScore: Math.floor(Math.random() * 40) + 30,
    };
    store.data.scans.unshift(scan);
    store.save();
    return mockResponse({ scanId: scan.id, status: "COMPLETED" });
  },
  list: async () => {
    await delay(300);
    return mockResponse(store.data.scans);
  },
  getById: async (id) => {
    await delay(200);
    const scan = store.data.scans.find((s) => s.id === id) || store.data.scans[0];
    return mockResponse({ ...scan, findings: store.data.findings, credential: store.data.credentials[0] });
  },
  getFindings: async (id, params = {}) => {
    await delay(200);
    let findings = [...store.data.findings];
    if (params.severity) findings = findings.filter((f) => f.severity === params.severity);
    if (params.service) findings = findings.filter((f) => f.service === params.service);
    return mockResponse(findings);
  },
};

export const dashboardAPI = {
  overview: async () => {
    await delay(300);
    const totalResources = store.data.resources.length;
    const totalFindings = store.data.findings.length;
    const lastScan = store.data.scans[0];
    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFORMATIONAL: 0 };
    store.data.findings.forEach((f) => { severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1; });
    const serviceMap = {};
    store.data.findings.forEach((f) => { serviceMap[f.service] = (serviceMap[f.service] || 0) + 1; });
    const serviceCounts = Object.entries(serviceMap).map(([service, count]) => ({ service, count }));
    const trend = [
      { completedAt: new Date(Date.now() - 172800000).toISOString(), complianceScore: 32, criticalCount: 6, highCount: 5 },
      { completedAt: new Date(Date.now() - 86400000).toISOString(), complianceScore: 45, criticalCount: 3, highCount: 4 },
      { completedAt: new Date().toISOString(), complianceScore: lastScan?.complianceScore || 38, criticalCount: 5, highCount: 4 },
    ];
    return mockResponse({
      totalResources,
      totalFindings,
      complianceScore: lastScan?.complianceScore || null,
      severityCounts,
      serviceCounts,
      recentScans: store.data.scans.slice(0, 5),
      trend,
      credentialsCount: store.data.credentials.length,
    });
  },
  resources: async (params = {}) => {
    await delay(300);
    let resources = [...store.data.resources];
    if (params.service) resources = resources.filter((r) => r.service === params.service);
    if (params.region) resources = resources.filter((r) => r.region.includes(params.region));
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 25;
    const total = resources.length;
    const paged = resources.slice((page - 1) * limit, page * limit);
    return mockResponse({ resources: paged, total, page, totalPages: Math.ceil(total / limit) });
  },
  services: async () => {
    await delay(200);
    const map = {};
    store.data.resources.forEach((r) => { map[r.service] = (map[r.service] || 0) + 1; });
    return mockResponse(Object.entries(map).map(([service, count]) => ({ service, count })));
  },
};

export const alertAPI = {
  list: async (params = {}) => {
    await delay(200);
    let alerts = [...store.data.alerts];
    if (params.unread === "true") alerts = alerts.filter((a) => !a.isRead);
    return mockResponse(alerts);
  },
  unreadCount: async () => {
    await delay(100);
    const count = store.data.alerts.filter((a) => !a.isRead).length;
    return mockResponse({ count });
  },
  markRead: async (id) => {
    await delay(100);
    const alert = store.data.alerts.find((a) => a.id === id);
    if (alert) alert.isRead = true;
    store.save();
    return mockResponse({ message: "OK" });
  },
  markAllRead: async () => {
    await delay(100);
    store.data.alerts.forEach((a) => (a.isRead = true));
    store.save();
    return mockResponse({ message: "OK" });
  },
};
