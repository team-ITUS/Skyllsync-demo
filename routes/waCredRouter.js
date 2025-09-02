const express = require("express");

const {updateCred,getCredDtl, } = require('../controllers/waCredController');

const waCredRouter = express.Router();

waCredRouter.put('/updateCred',updateCred);
waCredRouter.get('/getCredDtl',getCredDtl);

module.exports = {waCredRouter};