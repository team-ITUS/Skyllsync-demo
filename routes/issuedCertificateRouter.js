const express = require("express");
const {getExaminDtlById, updateExaminById, getMyCertList,isIssuedCert, getExportableData, certIdIncrementor, deleteIssuedCertificateByBatch} = require('../controllers/issuedCertificateController');

const issuedCertificateRouter = express.Router();


issuedCertificateRouter.get('/getExaminDtlById/:batchId',getExaminDtlById);
issuedCertificateRouter.get('/getExportableData/:batchId',getExportableData);
issuedCertificateRouter.put('/updateExaminById/:issuedCertificateId', updateExaminById);
issuedCertificateRouter.get('/getMyCertList/:studentId', getMyCertList);// get certificate list by studentId
issuedCertificateRouter.post('/isIssuedCert', isIssuedCert);// check certificate is issued or not

// POST route for certIdIncrementor
issuedCertificateRouter.post('/certIdIncrementor', certIdIncrementor);
issuedCertificateRouter.delete('/deleteIssuedCertificateByBatch/:batchId', deleteIssuedCertificateByBatch);

module.exports = {issuedCertificateRouter};