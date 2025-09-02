
// Updated LicenseTemplate.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { BASE_URL } from '../../../BaseURL';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import CustomButton from '../../../components/custom/CustomButton';
import InputField from '../../../components/custom/InputField';
import ActionMenu from '../../../components/custom/ActionMenu';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

const LicenseTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [searchName, setSearchName] = useState(null);
  const [form, setForm] = useState({
    licenseName: '',
    file: null,       // PDF file
    font: null,   // font file
    signature: null   // image file
  });
  const [deletingId, setDeletingId] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/license/getAll`);
      setTemplates(res.data.licenses || []);
    } catch { toast.error('Fetch failed'); }
    setLoading(false);
  };
  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleShow = tpl => {
    setEditTemplate(tpl);
    setForm({
      licenseName: tpl?.licenseName || '',
      file: null, font: null, signature: null
    }); setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false); setEditTemplate(null);
    setForm({ licenseName: '', file: null, font: null, signature: null });
  };
  const handleText = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const handleFile = e => { const { name, files } = e.target; setForm(p => ({ ...p, [name]: files[0] || null })); };

  const handleSubmit = async e => {
    e.preventDefault();
    const hasFile = form.file || form.font || form.signature;
    let data, headers;
    if (hasFile) {
      data = new FormData();
      ['licenseName'].forEach(k => data.append(k, form[k]));
      if (form.file) data.append('file', form.file);
      if (form.font) data.append('font', form.font);
      if (form.signature) data.append('signature', form.signature);
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      data = { licenseName: form.licenseName };
      headers = { 'Content-Type': 'application/json' };
    }
    try {
      const url = editTemplate ?
        `${BASE_URL}/license/${editTemplate.licenseId}` : `${BASE_URL}/license/add`;
      const method = editTemplate ? 'put' : 'post';
      await axios[method](url, data, { headers });
      toast.success(editTemplate ? 'Updated!' : 'Added!');
      handleCloseModal(); fetchTemplates();
    } catch (error) {
      console.error(error);
      toast.error('Save failed');
    }
  };

  const handleDelete = async id => {
    const result = await MySwal.fire({
      title: 'Delete License?',
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
      try { await axios.delete(`${BASE_URL}/license/${id}`); toast.success('Deleted!'); fetchTemplates(); }
      catch { toast.error('Delete failed'); }
      setDeletingId(null);
    }
  };

  const handleViewLicense = (license) => {
    if (license?.licenseUrl) {
      const fullUrl = `${BASE_URL}/${license.licenseUrl}`
      window.open(fullUrl, '_blank') // Open PDF in a new tab
    }
  }

  return (
    <div className="mainTableContainer">
      <Toaster position="top-center" />
      <h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>License Templates</h4>
      <div className="d-flex justify-content-between mb-3">
        <div style={{ width: '300px' }}>
          <InputField
            type="text"
            label='Search By'
            placeholder="Search by Name or Code"
            value={searchName || ''}
            onChange={setSearchName}
          />
        </div>
        <CustomButton title='Add License' icon="tabler_plus.svg" onClick={() => handleShow()} />
      </div>
      <div className="table-container outer-table mt-4">
        <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
          <thead><tr><th>#</th><th className="special-yellow">Name</th><th>Font</th><th className="special-blue">URL</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={5}><Spinner animation="border" /></td></tr>
              : templates.length === 0
                ? <tr><td colSpan={5}>No templates</td></tr>
                : templates
                  .filter(template =>
                    !searchName || template?.licenseName?.toLowerCase()?.includes(searchName.toLowerCase())
                  ).map((tpl, i) => (
                    <tr key={tpl.licenseId}>
                      <td>{i + 1}</td><td className="special-yellow">{tpl.licenseName}</td><td>{tpl.licenseFont}</td>
                      <td className="special-blue">{tpl.licenseUrl}</td>
                      <td className="position-relative">
                        <ActionMenu
                          options={[
                            {
                              icon: 'Check.svg',
                              title: 'View License',
                              onClick: () => handleViewLicense(tpl),
                            },
                            {
                              icon: 'material-symbols_edit-outline.svg',
                              title: 'Edit Template',
                              onClick: () => handleShow(tpl),
                            },
                            {
                              icon: 'material-symbols_delete-outline.svg',
                              title: 'Delete Template',
                              onClick: () => handleDelete(tpl.licenseId),
                              disabled: deletingId === tpl.licenseId,
                              loading: deletingId === tpl.licenseId,
                            }
                          ].filter(Boolean)}
                        />

                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>


      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton><Modal.Title>{editTemplate ? 'Update' : 'Add'} License</Modal.Title></Modal.Header>
        <Form>
          <Modal.Body>
            <div className="row px-4 py-3">
              {[
                { label: 'Name', name: 'licenseName', type: 'text' },
                { label: 'Font File', name: 'font', type: 'file', accept: '.ttf,.otf' },
                { label: 'PDF File', name: 'file', type: 'file', accept: 'application/pdf' },
                { label: 'Signature', name: 'signature', type: 'file', accept: 'image/*' },
              ].map((f) => (
                <div className="mb-2" key={f.name}>
                  <InputField
                    label={f.label}
                    type={f.type}
                    name={f.name}
                    accept={f.accept}
                    value={f.type === 'file' ? form[f.name] : form[f.name] || ''}
                    onChange={
                      f.type === 'file'
                        ? handleFile
                        : (val) => handleText({ target: { name: f.name, value: val } })
                    }
                    required={f.name === 'licenseName'}
                  />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className='mb-2'>
            <CustomButton title='Cancel' icon="wrong.svg" variant="outline" onClick={handleCloseModal} />
            <CustomButton title={editTemplate ? 'Update' : 'Add'} icon="tabler_plus.svg" onClick={handleSubmit} />
          </Modal.Footer>
        </Form>

      </Modal>
    </div>
  );
};

export default LicenseTemplate;