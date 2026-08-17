const prisma = require("../config/database");

exports.getCredentials = async (req, res, next) => {
  try {
    const creds = await prisma.aWSCredential.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true, label: true, accessKeyId: true, region: true,
        accountNumber: true, isActive: true, lastScannedAt: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const masked = creds.map((c) => ({
      ...c,
      accessKeyId: c.accessKeyId.slice(0, 6) + "****",
    }));

    res.json(masked);
  } catch (err) {
    next(err);
  }
};

exports.addCredential = async (req, res, next) => {
  try {
    const { label, accessKeyId, secretAccessKey, region } = req.body;
    if (!label || !accessKeyId || !secretAccessKey) {
      return res.status(400).json({ error: "label, accessKeyId, and secretAccessKey are required" });
    }

    const AWSService = require("../services/aws.service");
    const svc = new AWSService({ accessKeyId, secretAccessKey, region: region || "us-east-1" });
    let accountNumber;
    try {
      accountNumber = await svc.getAccountId();
    } catch {
      return res.status(400).json({ error: "Invalid AWS credentials" });
    }

    const cred = await prisma.aWSCredential.create({
      data: {
        userId: req.user.userId,
        label,
        accessKeyId,
        secretAccessKey,
        region: region || "us-east-1",
        accountNumber,
      },
    });

    res.status(201).json({
      id: cred.id, label: cred.label, accessKeyId: cred.accessKeyId.slice(0, 6) + "****",
      region: cred.region, accountNumber: cred.accountNumber,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cred = await prisma.aWSCredential.findFirst({
      where: { id, userId: req.user.userId },
    });
    if (!cred) return res.status(404).json({ error: "Credential not found" });

    await prisma.aWSCredential.delete({ where: { id } });
    res.json({ message: "Credential deleted" });
  } catch (err) {
    next(err);
  }
};
