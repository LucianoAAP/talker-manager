const express = require('express');
const bodyParser = require('body-parser');
const rescue = require('express-rescue');
const fs = require('fs/promises');
const crypto = require('crypto');
const { validateEmail, validatePassword } = require('./middlewares/validateLogin');
const auth = require('./middlewares/authorization');
const errorMiddleware = require('./middlewares/error');
const {
  validateName,
  validateAge,
  validateTalk,
  createId } = require('./middlewares/validateNewTalker');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const talkersFile = 'talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', rescue(async (_req, res) => {
  const talkers = await fs.readFile(talkersFile, 'utf-8').then((r) => JSON.parse(r));
  if (!talkers || talkers.length === 0) return res.status(200).json([]);
  return res.status(200).json(talkers);
}));

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await fs.readFile(talkersFile, 'utf-8').then((r) => JSON.parse(r));
  const talker = talkers.find((person) => person.id === parseFloat(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return res.status(200).json(talker);
});

app.post('/login', validateEmail, validatePassword, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

app.post('/talker', [auth, validateName, validateAge, validateTalk, rescue(async (req, res) => {
  const { name, age, talk } = req.body;
  const talkers = await fs.readFile(talkersFile, 'utf-8').then((r) => JSON.parse(r));
  const id = createId(talkers);
  const newTalker = { id, name, age, talk };
  const newTalkers = [...talkers, newTalker];
  await fs.writeFile(talkersFile, JSON.stringify(newTalkers));
  return res.status(201).json(newTalker);
})]);

app.put('/talker/:id', [auth, validateName, validateAge, validateTalk, rescue(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, age, talk } = req.body;
  const talkers = await fs.readFile(talkersFile, 'utf-8').then((r) => JSON.parse(r));
  const newTalker = { id, name, age, talk };
  const newTalkers = talkers.map((talker) => {
    if (talker.id === id) return newTalker;
    return talker;
  });
  await fs.writeFile(talkersFile, JSON.stringify(newTalkers));
  return res.status(200).json(newTalker);
})]);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Online');
});
