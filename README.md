# Einbürgerungstest Bayern

Trainer for the German citizenship test (Bayern): questions, flashcards, vocab, and a timed exam.

```bash
npm install
npm start
```

Hosted as a free [Render](https://render.com/) static site. Progress can sync to MongoDB (`einburgerung` database on the existing Atlas cluster) after you create a Konto under Einstellungen.

```bash
# API (needs server/.env — see server/.env.example)
npm run server

# App
npm start
```
