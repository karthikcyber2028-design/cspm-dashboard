const prisma = require("../config/database");

exports.getAlerts = async (req, res, next) => {
  try {
    const { unread } = req.query;
    const where = { userId: req.user.userId };
    if (unread === "true") where.isRead = false;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await prisma.alert.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data: { isRead: true },
    });
    res.json({ message: "Alert marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await prisma.alert.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All alerts marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await prisma.alert.count({
      where: { userId: req.user.userId, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};
