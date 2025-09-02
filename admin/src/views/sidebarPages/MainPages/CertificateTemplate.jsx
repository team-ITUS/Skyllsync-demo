import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import InputField from '../../../components/custom/InputField';
import CustomButton from '../../../components/custom/CustomButton';
import ActionMenu from '../../../components/custom/ActionMenu';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

const CertificateTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [searchName, setSearchName] = useState(null);
  const [form, setForm] = useState({
    certificateName: '',
    certificateCode: '',
    file: null,    // PDF file
    font: null            // font file
  });
  const [deletingId, setDeletingId] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/certificate/getCertificateList`);
      setTemplates(res.data.certificateList || []);
    } catch {
      toast.error('Failed to fetch templates');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleShowModal = tpl => {
    setEditTemplate(tpl);
    setForm({
      certificateName: tpl?.certificateName || '',
      certificateCode: tpl?.certificateCode || '',
      file: null,
      font: null
    });
    setShowModal(true);
  };
  const handleClose = () => { setShowModal(false); setEditTemplate(null); setForm({ certificateName: '', certificateCode: '', file: null, font: null }); };

  const handleTextChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = e => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files[0] || null }));
  };

  const handleViewCertificate = (certificate) => {
    if (certificate?.certificateUrl) {
      const fullUrl = `${BASE_URL}/${certificate.certificateUrl}`
      window.open(fullUrl, '_blank') // Open PDF in a new tab
    }
  }

  const handleSubmit = async e => {
    e.preventDefault();
    // Determine if files present
    const hasFile = form.file || form.font;
    let data, headers;

    if (hasFile) {
      data = new FormData();
      // append text
      ['certificateName', 'certificateCode'].forEach(k => data.append(k, form[k]));
      // append files
      if (form.file) data.append('file', form.file);
      if (form.font) data.append('font', form.font);
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      data = {
        certificateName: form.certificateName,
        certificateCode: form.certificateCode,
      };
      headers = { 'Content-Type': 'application/json' };
    }

    try {
      const url = editTemplate
        ? `${BASE_URL}/certificate/update/${editTemplate.certificateId}`
        : `${BASE_URL}/certificate/addCertificate`;
      const method = editTemplate ? 'put' : 'post';
      await axios[method](url, data, { headers });
      toast.success(editTemplate ? 'Updated!' : 'Added!');
      handleClose(); fetchTemplates();
    } catch {
      toast.error('Save failed');
    }
  };

  const handleDelete = async id => {
    const result = await MySwal.fire({
      title: 'Delete Certificate?',
      text: 'This action cannot be undone.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EBA135',  // Yellow (for destructive action)
      cancelButtonColor: '#374174',   // Navy Blue
      background: '#fefefe',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      }
    });
    if (result.isConfirmed) {
      setDeletingId(id);
      try { await axios.delete(`${BASE_URL}/certificate/delete/${id}`); toast.success('Deleted!'); fetchTemplates(); }
      catch { toast.error('Delete failed'); }
      setDeletingId(null);
    }

  };

  return (
    <div className="mainTableContainer">
      <Toaster position="top-center" />
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>Certificate Templates</h4>
      <div className="d-flex justify-content-between m-3">
        <div style={{ width: '300px' }}>
          <InputField
            type="text"
            label="Search By"
            placeholder="Search by Name or Code"
            value={searchName || ''}
            onChange={setSearchName}
          />
        </div>
        <CustomButton title='Add Certificate' icon="tabler_plus.svg" onClick={() => handleShowModal()} />
      </div>
      <div className='table-container outer-table mt-4'>
        <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
          <thead><tr><th>#</th><th className="special-yellow">Name</th><th>Code</th><th>Font</th><th className="special-blue">URL</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6}><Spinner animation="border" /></td></tr>
              : templates.length === 0
                ? <tr><td colSpan={6}>No templates</td></tr>
                : templates
                  .filter(template =>
                    !searchName || template?.certificateName?.toLowerCase()?.includes(searchName.toLowerCase())
                  ).map((tpl, i) => (
                    <tr key={tpl.certificateId}>
                      <td>{i + 1}</td><td className="special-yellow">{tpl.certificateName}</td><td>{tpl.certificateCode}</td>
                      <td>{tpl.certificateFont}</td><td className="special-blue">{tpl.certificateUrl}</td>
                      <td className="position-relative">
                        <ActionMenu
                          options={[
                            {
                              icon: 'Check.svg',
                              title: 'View Template',
                              onClick: () => handleViewCertificate(tpl),
                            },
                            {
                              icon: 'material-symbols_edit-outline.svg',
                              title: 'Edit Template',
                              onClick: () => handleShowModal(tpl),
                            },
                            {
                              icon: 'material-symbols_delete-outline.svg',
                              title: 'Delete Template',
                              onClick: () => handleDelete(tpl.certificateId),
                              disabled: deletingId === tpl.certificateId,
                              loading: deletingId === tpl.certificateId,
                            },
                          ].filter(Boolean)}
                        />

                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton><Modal.Title>{editTemplate ? 'Update' : 'Add'} Certificate</Modal.Title></Modal.Header>
          <Form>
            <Modal.Body>
              <div className="row px-4 py-3">
                {[
                  { label: 'Name', name: 'certificateName', type: 'text' },
                  { label: 'Code', name: 'certificateCode', type: 'text' },
                  { label: 'Font File', name: 'font', type: 'file', accept: '.ttf,.otf' },
                  { label: 'PDF File', name: 'file', type: 'file', accept: 'application/pdf' },
                ].map((f) => (
                  <div className="mb-2" key={f.name}>
                    <InputField
                      label={f.label}
                      type={f.type}
                      name={f.name}
                      accept={f.accept}
                      value={f.type === 'file' ? form[f.name] : form[f.name] || ''}
                      onChange={f.type === 'file' ? handleFileChange : (val) => handleTextChange({ target: { name: f.name, value: val } })}
                      required={['certificateName', 'certificateCode'].includes(f.name)}
                    />
                  </div>
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer className='mb-2'>
              <CustomButton title='Cancel' variant="outline" icon="wrong.svg" onClick={handleClose} />
              <CustomButton title={editTemplate ? 'Update' : 'Add'} icon="tabler_plus.svg" onClick={handleSubmit} />
            </Modal.Footer>
          </Form>

        </Modal>
      </div>

    </div>
  );
};

export default CertificateTemplate;