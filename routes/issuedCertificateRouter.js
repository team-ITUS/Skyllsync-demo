const express = require("express");
const {getExaminDtlById, updateExaminById, getMyCertList,isIssuedCert, getExportableData, certIdIncrementor, deleteIssuedCertificateByBatch, issueSingleCertificateById} = require('../controllers/issuedCertificateController');

const issuedCertificateRouter = express.Router();


issuedCertificateRouter.get('/getExaminDtlById/:batchId',getExaminDtlById);
issuedCertificateRouter.get('/getExportableData/:batchId',getExportableData);
issuedCertificateRouter.put('/updateExaminById/:issuedCertificateId', updateExaminById);
issuedCertificateRouter.get('/getMyCertList/:studentId', getMyCertList);// get certificate list by studentId
issuedCertificateRouter.post('/isIssuedCert', isIssuedCert);// check certificate is issued or not

// Issue a single certificate by batchId and studentId
// Accept batchId and studentId as URL params to match controller's req.params usage
issuedCertificateRouter.post('/issueSingleCertificate/:batchId/:studentId', issueSingleCertificateById);

// POST route for certIdIncrementor
issuedCertificateRouter.post('/certIdIncrementor', certIdIncrementor);
issuedCertificateRouter.delete('/deleteIssuedCertificateByBatch/:batchId', deleteIssuedCertificateByBatch);

module.exports = {issuedCertificateRouter};