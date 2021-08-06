require('dotenv').config()
const { Router, request, response } = require("express");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Note = require('./models/note')


//Start app
const app = express();

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true,
  },
];

//Needed
app.use(cors());
app.use(express.static("build"));
app.use(express.json());

//Request logs
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("Code:", response.statusCode);
  console.log("---");
  next();
};
app.use(requestLogger);

//Id generator
const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

//Post note
app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });
	note.save().then(savedNote => {
		response.json(savedNote)
	})
});

//Fetching notes (all/single)
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
		response.json(notes)
	});
});

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id).then(note => {
		response.json(note)
	})

});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((n) => n.id !== id);

  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
