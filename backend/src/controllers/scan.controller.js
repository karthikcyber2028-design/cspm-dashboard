const prisma = require("../config/database");
const AWSService = require("../services/aws.service");

exports.runScan = async (req, res, next) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: "credentialId is required" });
    }

    const cred = await prisma.aWSCredential.findFirst({
      where: { id: credentialId, userId: req.user.userId },
    });
    if (!cred) return res.status(404).json({ error: "Credential not found" });

    const scan = await prisma.scan.create({
      data: { userId: req.user.userId, credentialId, status: "RUNNING" },
    });

    res.status(202).json({ scanId: scan.id, status: "RUNNING" });

    this._executeScan(scan.id, cred).catch((err) => {
      console.error("Scan execution error:", err);
    });
  } catch (err) {
    next(err);
  }
};

exports._executeScan = async (scanId, credential) => {
  try {
    const awsService = new AWSService(credential);
    const { resources, findings } = await awsService.scanAll();

    const resourceMap = {};

    for (const r of resources) {
      const existing = await prisma.aWSResource.findFirst({
        where: { credentialId: credential.id, awsId: r.awsId },
      });

      let resource;
      const resourceData = {
        credentialId: credential.id,
        awsId: r.awsId,
        service: r.service,
        name: r.name,
        region: r.region,
        resourceType: r.resourceType,
        arn: r.ARN,
        isPublic: r.isPublic,
        isEncrypted: r.isEncrypted,
        complianceTags: JSON.stringify(r.complianceTags || []),
        metadata: r.metadata || {},
        lastUpdated: new Date(),
      };

      if (existing) {
        resource = await prisma.aWSResource.update({
          where: { id: existing.id },
          data: resourceData,
        });
      } else {
        resource = await prisma.aWSResource.create({ data: resourceData });
      }
      resourceMap[r.awsId] = resource.id;
    }

    const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

    for (const f of findings) {
      const resourceId = f.resourceAwsId ? resourceMap[f.resourceAwsId] : null;

      await prisma.finding.create({
        data: {
          scanId,
          resourceId,
          service: f.service,
          title: f.title,
          description: f.description,
          severity: f.severity,
          remediation: f.remediation,
          complianceId: f.complianceId,
        },
      });

      if (f.severity === "CRITICAL") counts.critical++;
      else if (f.severity === "HIGH") counts.high++;
      else if (f.severity === "MEDIUM") counts.medium++;
      else if (f.severity === "LOW") counts.low++;
      else counts.info++;
    }

    const totalFindings = counts.critical + counts.high + counts.medium + counts.low;
    const maxScore = resources.length * 10 + totalFindings * 5;
    const score = maxScore > 0 ? Math.max(0, Math.round(100 - (totalFindings / resources.length) * 10)) : 100;

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        resourcesFound: resources.length,
        findingsCount: totalFindings,
        criticalCount: counts.critical,
        highCount: counts.high,
        mediumCount: counts.medium,
        lowCount: counts.low,
        complianceScore: score,
      },
    });

    await prisma.aWSCredential.update({
      where: { id: credential.id },
      data: { lastScannedAt: new Date() },
    });

    if (counts.critical > 0 || counts.high > 0) {
      await prisma.alert.create({
        data: {
          userId: credential.userId,
          scanId,
          title: `Scan completed: ${counts.critical} critical, ${counts.high} high findings`,
          message: `Found ${totalFindings} security issues across ${resources.length} resources`,
          severity: counts.critical > 0 ? "CRITICAL" : "HIGH",
        },
      });
    }
  } catch (err) {
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "FAILED", completedAt: new Date() },
    });
    console.error("Scan failed:", err);
  }
};

exports.getScans = async (req, res, next) => {
  try {
    const scans = await prisma.scan.findMany({
      where: { userId: req.user.userId },
      include: { credential: { select: { label: true } } },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    res.json(scans);
  } catch (err) {
    next(err);
  }
};

exports.getScanById = async (req, res, next) => {
  try {
    const scan = await prisma.scan.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: { findings: true, credential: { select: { label: true } } },
    });
    if (!scan) return res.status(404).json({ error: "Scan not found" });
    res.json(scan);
  } catch (err) {
    next(err);
  }
};

exports.getScanFindings = async (req, res, next) => {
  try {
    const { severity, service, status } = req.query;
    const where = { scanId: req.params.id };
    if (severity) where.severity = severity;
    if (service) where.service = service;
    if (status) where.status = status;

    const findings = await prisma.finding.findMany({
      where,
      include: { resource: { select: { awsId: true, name: true, service: true } } },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });
    res.json(findings);
  } catch (err) {
    next(err);
  }
};
