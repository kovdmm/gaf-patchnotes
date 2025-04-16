const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async function (req, res, next) {
  // Имитация реальной загрузки
  await delay(50 + Math.random() * 200);
  if (req.originalUrl.endsWith(".gif")) await delay(500 + Math.random() * 500);
  next();
};
