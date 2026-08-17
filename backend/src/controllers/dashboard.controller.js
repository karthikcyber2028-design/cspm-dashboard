const prisma = require("../config/database");

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [totalResources, totalFindings, recentScans, credentials] = await Promise.all([
      prisma.aWSResource.count({
        where: { credential: { userId } },
      }),
      prisma.finding.count({
        where: { scan: { userId }, status: "OPEN" },
      }),
      prisma.scan.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 5,
      }),
      prisma.aWSCredential.findMany({
        where: { userId },
        select: { id: true, lastScannedAt: true },
      }),
    ]);

    const lastScan = recentScans[0] || null;

    const severityCounts = await prisma.finding.groupBy({
      by: ["severity"],
      where: { scan: { userId }, status: "OPEN" },
      _count: true,
    });

    const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFORMATIONAL: 0 };
    severityCounts.forEach((s) => {
      severityMap[s.severity] = s._count;
    });

    const serviceCounts = await prisma.finding.groupBy({
      by: ["service"],
      where: { scan: { userId }, status: "OPEN" },
      _count: true,
    });

    const trend = await prisma.scan.findMany({
      where: { userId, status: "COMPLETED" },
      select: { completedAt: true, complianceScore: true, criticalCount: true, highCount: true },
      orderBy: { completedAt: "asc" },
      take: 30,
    });

    res.json({
      totalResources,
      totalFindings,
      complianceScore: lastScan?.complianceScore || null,
      severityCounts: severityMap,
      serviceCounts: serviceCounts.map((s) => ({ service: s.service, count: s._count })),
      recentScans,
      trend,
      credentialsCount: credentials.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.getResources = async (req, res, next) => {
  try {
    const { service, region, page = 1, limit = 25 } = req.query;
    const where = { credential: { userId: req.user.userId } };
    if (service) where.service = service;
    if (region) where.region = region;

    const [resources, total] = await Promise.all([
      prisma.aWSResource.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { riskScore: "desc" },
      }),
      prisma.aWSResource.count({ where }),
    ]);

    res.json({ resources, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const services = await prisma.aWSResource.groupBy({
      by: ["service"],
      where: { credential: { userId: req.user.userId } },
      _count: true,
    });
    res.json(services.map((s) => ({ service: s.service, count: s._count })));
  } catch (err) {
    next(err);
  }
};
