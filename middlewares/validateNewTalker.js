const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name || name === '') {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age || age === '') return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (parseFloat(age) < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
};

const getTalkStatus = (talk) => (
  !talk || !talk.watchedAt || talk.rate === undefined || talk.watchedAt === '' || talk.rate === ''
  );

const getWatchedAtStatus = (watchedAt) => {
  // Regex tirado de https://support.dooblo.net/hc/en-us/articles/208295925-How-To-Validate-Date-Format-Using-Regular-Expression
  const date = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([12][0-9]{3})$/;
  return date.test(watchedAt);
};

const getRateStatus = (rate) => parseInt(rate, 10) < 1 || parseInt(rate, 10) > 5;

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (getTalkStatus(talk)) {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' });
  }
  const { watchedAt, rate } = talk;
  if (!getWatchedAtStatus(watchedAt)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  if (getRateStatus(rate)) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

const createId = (talkers) => {
  if (talkers.length === 0) return 1;
  const sortedTalkers = talkers.sort((a, b) => a.id - b.id);
  return sortedTalkers[sortedTalkers.length - 1].id + 1;
};

module.exports = { validateName, validateAge, validateTalk, createId };
