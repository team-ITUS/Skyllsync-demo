const express = require("express");
const {
  loginAccessor,
  getAccessorList,
  deleteAccessorById,
  updateAccessorById,
  getAccessorById,
  getMyAccessorList,
} = require("../controllers/accessorController");
const { upload } = require("../services/fileUploadService");

const accessorRouter = express.Router();

accessorRouter.post("/loginAccessor", loginAccessor); //accessor login
accessorRouter.get("/getAccessorList", getAccessorList); // get all accessor list
accessorRouter.delete("/deleteAccessorById/:accessorId", deleteAccessorById); //delete accessor by accessorId
accessorRouter.put(
  "/updateAccessorById/:accessorId",
  upload.fields([
    { name: "accessorProfile", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateAccessorById
); //update accessor by accessorId
accessorRouter.get("/getAccessorById/:accessorId", getAccessorById);
accessorRouter.get("/getMyAccessorList/:studentId", getMyAccessorList); //get student assign accessor list

module.exports = { accessorRouter };
