const express = require("express");
const {
  createSession,
  deleteSessionById,
  updateSessionById,
  getSessionById,
  getlessonOfSession,
} = require("../controllers/sessionController");

const sessionRouter = express.Router();

sessionRouter.post("/createSession", createSession); //create session
sessionRouter.delete("/deleteSessionById/:sessionId", deleteSessionById); // delete session by sessionId
sessionRouter.put("/updateSessionById/:sessionId", updateSessionById); // update session by sessionId
sessionRouter.get("/getSessionById/:sessionId", getSessionById); // get session by sessionId
sessionRouter.get("/getlessonOfSession/:sessionId", getlessonOfSession); // get lesson under that session by sessionId

module.exports = { sessionRouter };
