const express = require('express');
const {generateCertificate, addCertificate, getCertificateList, downloadCert, verify, downloadMultCert, updateCertificate, deleteCertificate} = require('../controllers/certificateController');
const { upload } = require('../services/fileUploadService');

const certificateRouter = express.Router();

certificateRouter.post('/generateCertificate',generateCertificate);//generate single certificate to student
certificateRouter.post('/addCertificate', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'font', maxCount: 1 }]), addCertificate);// add new certificate 
certificateRouter.put('/update/:certificateId', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'font', maxCount: 1 }]), updateCertificate);// update certificate by id
certificateRouter.delete('/delete/:certificateId', deleteCertificate);// delete certificate by id
certificateRouter.get('/getCertificateList', getCertificateList);// get all certificate list
certificateRouter.post('/downloadCert', downloadCert);//
certificateRouter.get('/verify/:batchId/:studentId',verify);//verify certificate
certificateRouter.post('/downloadMultCert', downloadMultCert);//download multiple certificate

module.exports = {certificateRouter};