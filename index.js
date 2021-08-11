require("dotenv").config();
const { Router, request, response } = require("express");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Note = require("./models/note");

//Start app
const app = express();

//Needed
app.use(cors());
app.use(express.static("build"));
app.use(express.json());

//Request logs
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(requestLogger);

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
  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

//Fetching notes (all/single)
app.get("/api/notes", (request, response, next) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => next(err));
});

//Updating importance
app.put("/api/notes/:id", (req, res, next) => {
  const id = req.params.id
  const body = req.body;

  const boilerNote = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(id, boilerNote, { new: true })
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch((err) => next(err));
});

//Deleting note handler
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((deletedNote) => {
      response.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

//Handler for unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

//Handler for requests with result of errors
const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === "CastError") {
    res.status(400).send({ err: "malformated id syntax" });
  }

  next(err);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
