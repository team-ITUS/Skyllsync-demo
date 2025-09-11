import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import '../../SidebarCss/Table.css' // Import the CSS file
import { BASE_URL } from '../../../BaseURL' // Import the BASE_URL
import { Modal, Form, Spinner } from 'react-bootstrap'
import toast, { Toaster } from 'react-hot-toast';
import { formatName, normalizeEmail, toISODate } from '../../../utils/dataHelpers';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'sweetalert2/src/sweetalert2.scss';

const MySwal = withReactContent(Swal)

import 'react-toastify/dist/ReactToastify.css' // Import CSS for react-toastify
// Importing XLSX for Excel file reading
import * as XLSX from 'xlsx' // Import XLSX to read Excel files
import { useNavigate, useLocation } from 'react-router-dom'
import InputField from '../../../components/custom/InputField'
import Date_Picker from '../../../components/custom/Date_Picker'
import CustomButton from '../../../components/custom/CustomButton'
import ActionMenu from '../../../components/custom/ActionMenu'
import Pagination from '../../../components/custom/Pagination'
import RegisterStudentForm from './RegisterStudentForm'

const RegisteredStudentsTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showModal, setShowModal] = useState(false) // Modal visibility state
  const [viewModal, setViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [enrolledBatches, setEnrolledBatches] = useState([])
  const limit = 50 // Set the number of items per page
  // State to manage edit mode and student data
  const [isEditMode, setIsEditMode] = useState(false)
  const [studentData, setStudentData] = useState(selectedStudent)
  const navigate = useNavigate() // Initialize useNavigate
  const location = useLocation()
  const PERSIST_KEY = React.useMemo(() => `registeredStudentsFilters:${location.pathname}`, [location.pathname])
  const PERSIST_FALLBACK_KEY = 'registeredStudentsFilters'
  const [selectedFiles, setSelectedFiles] = useState({
    imagePath: null,
    adhaarImage: null,
  })

  const [isImporting, setIsImporting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Add these states at the top
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)
  // Student Filter state (for /student/filter-students)
  const [showStudentFilter, setShowStudentFilter] = useState(false)
  const [isFilteredMode, setIsFilteredMode] = useState(false)
  const [studentFilter, setStudentFilter] = useState({
    certificateId: '',
    batchName: '',
    courseName: '',
    branchName: '',
    startDate: null,
    endDate: null,
  })
  // Dropdown option state for filters
  const [batchOptions, setBatchOptions] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [isFilterMetaLoading, setIsFilterMetaLoading] = useState(false)

  // Fetch selectable lists (batches, courses, branches) once when filter panel first opens or if previously persisted value exists
  const loadFilterMeta = async () => {
    if (isFilterMetaLoading) return
    setIsFilterMetaLoading(true)
    try {
      // Fetch with higher limit to populate full dropdown lists
      const reqs = [
        axios.get(`${BASE_URL}/batch/getAllBatch`, { params: { page: 1, limit: 1000 } }).catch(() => ({ data: {} })),
        axios.get(`${BASE_URL}/course/getAllCourses`).catch(() => ({ data: {} })),
        axios.get(`${BASE_URL}/branch/getAllBranches`).catch(() => ({ data: {} })),
      ]
      const [bRes, cRes, brRes] = await Promise.all(reqs)

      // Batches
      // Actual controller returns allBatchDtl array
      const bList = bRes?.data?.allBatchDtl || bRes?.data?.batchList || bRes?.data?.batches || bRes?.data?.data || bRes?.data?.batch || []
      if (Array.isArray(bList)) {
        const opts = [...new Set(bList.map(b => (b.batchName || b.name || '').trim()).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b))
          .map(v => ({ label: v, value: v }))
        setBatchOptions([{ label: 'All', value: '' }, ...opts])
      }

      // Courses
      const cList = cRes?.data?.coursesList || []
      if (Array.isArray(cList)) {
        const opts = [...new Set(cList.map(c => (c.courseName || '').trim()).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b))
          .map(v => ({ label: v, value: v }))
        setCourseOptions([{ label: 'All', value: '' }, ...opts])
      }

      // Branches
      const brList = brRes?.data?.branchesList || []
      if (Array.isArray(brList)) {
        const opts = [...new Set(brList.map(br => (br.branchName || '').trim()).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b))
          .map(v => ({ label: v, value: v }))
        setBranchOptions([{ label: 'All', value: '' }, ...opts])
      }
    } catch (e) {
      // Silent fail; dropdowns will remain empty text fallback
    } finally {
      setIsFilterMetaLoading(false)
    }
  }

  // When panel opens, load metadata if not already loaded
  useEffect(() => {
    if (showStudentFilter && (batchOptions.length === 0 || courseOptions.length === 0 || branchOptions.length === 0)) {
      loadFilterMeta()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStudentFilter])

  // Also attempt loading once on mount if any persisted value exists (so dropdown shows it)
  useEffect(() => {
    if (hasAnyFilter(studentFilter)) {
      loadFilterMeta()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Track the last applied filter signature to avoid redundant applies
  const lastAppliedKeyRef = useRef('')
  const autoApplyDebounceRef = useRef(null)
  // Fetch registered students from the backend
  const fetchStudents = async (currentPage) => {
    try {
      // When filters are active, delegate to filtered fetcher
      if (isFilteredMode) {
        await fetchFilteredStudents(currentPage)
        return
      }
      const response = await axios.get(`${BASE_URL}/student/getRegisteredStud`, {
        params: { page: currentPage, limit, searchTerm, dateFrom, dateTo },
      })

      const respData = response.data

      if (respData?.success) {
        setStudents(respData.studentDtl)
        setTotalPages(respData.totalPages) // Set total pages from response
      } else {
        toast.error(respData?.message || 'No Student available')
      }
    } catch (err) {
      setStudents([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Fetch students for search (ignores filtered mode) so search works even when filters are applied
  const fetchSearchResults = async (pageVal) => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/student/getRegisteredStud`, {
        params: { page: pageVal || 1, limit, searchTerm, dateFrom, dateTo },
      })
      const respData = response.data
      if (respData?.success) {
        setStudents(respData.studentDtl)
        setTotalPages(respData.totalPages)
      } else {
        setStudents([])
        setTotalPages(1)
      }
    } catch (err) {
      setStudents([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Persistence using history.state (no localStorage)
  const buildPersistableFilters = (filters) => {
    const normalizeSel = (v) => (v && typeof v === 'object') ? (v.value ?? '') : v
    return {
      certificateId: normalizeSel(filters.certificateId) || '',
      batchName: normalizeSel(filters.batchName) || '',
      courseName: normalizeSel(filters.courseName) || '',
      branchName: normalizeSel(filters.branchName) || '',
      startDate: filters.startDate ? toISODate(filters.startDate) : '',
      endDate: filters.endDate ? toISODate(filters.endDate) : '',
    }
  }
const buildSearchFromFilters = (filters, pageVal) => {
    const f = buildPersistableFilters(filters)
    const sp = new URLSearchParams()
    if (f.courseName) sp.set('courseName', f.courseName)
    if (f.batchName) sp.set('batchName', f.batchName)
    if (f.branchName) sp.set('branchName', f.branchName)
    if (f.certificateId) sp.set('certificateId', f.certificateId)
    if (f.startDate) sp.set('startDate', f.startDate)
    if (f.endDate) sp.set('endDate', f.endDate)
    if (pageVal && Number(pageVal) > 1) sp.set('page', String(pageVal))
    return `?${sp.toString()}`
  }

  const parseFiltersFromSearch = (search) => {
    const sp = new URLSearchParams(search || '')
    const get = (k) => sp.get(k) || ''
    const isoToDate = (s) => {
      if (!s) return null
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    }
    const filters = {
      courseName: get('courseName'),
      batchName: get('batchName'),
      branchName: get('branchName'),
      certificateId: get('certificateId'),
      startDate: isoToDate(get('startDate')),
      endDate: isoToDate(get('endDate')),
    }
    const page = Number(sp.get('page') || '1') || 1
    return { filters, page }
  }

  const saveFiltersToHistory = (filters, extras = {}) => {
    try {
      const payload = {
        ...buildPersistableFilters(filters),
        applied: true,
        page: typeof extras.page === 'number' ? extras.page : currentPage,
      }
      const prev = window.history.state || {}
      const storeRoot = prev.__filters__ || {}
      const forPath = {
        filters: payload,
        showPanel: typeof extras.showPanel === 'boolean' ? extras.showPanel : showStudentFilter,
        isFilteredMode: typeof extras.isFilteredMode === 'boolean' ? extras.isFilteredMode : isFilteredMode,
      }
      const next = { ...prev, __filters__: { ...storeRoot, [location.pathname]: forPath } }
      try { console.debug('[studentFilters][history] save ->', next) } catch(e) {}
      window.history.replaceState(next, document.title, window.location.href)
      // also reflect in URL (replace) for durable persistence/shareable links
      const newSearch = buildSearchFromFilters(filters, payload.page)
      try {
        if (location.search !== newSearch) navigate({ search: newSearch }, { replace: true })
      } catch {}
  // sessionStorage fallback to persist across new route entries
  try {
        sessionStorage.setItem(PERSIST_KEY, JSON.stringify(forPath))
        sessionStorage.setItem(PERSIST_FALLBACK_KEY, JSON.stringify(forPath))
      } catch {}
    } catch {}
  }

  // Detect if we have persisted filters for this route (history.state or sessionStorage)
  const hasPersistedFilters = () => {
    try {
      const root = window.history.state || {}
      if (root.__filters__ && root.__filters__[location.pathname]) return true
      if (sessionStorage.getItem(PERSIST_KEY)) return true
    } catch {}
    return false
  }

  // Apply filters without toasts or panel side-effects (used on resume/navigation back)
  const applyFiltersSilently = async () => {
    if (!hasAnyFilter(studentFilter)) return
    const key = JSON.stringify(buildPersistableFilters(studentFilter))
    if (isFilteredMode && lastAppliedKeyRef.current === key) return
    const nextPage = 1
    setIsFilteredMode(true)
    setCurrentPage(nextPage)
    try { saveFiltersToHistory(studentFilter, { page: nextPage, isFilteredMode: true, showPanel: showStudentFilter }) } catch {}
    // fetch immediately to avoid timing issues on navigation back
    await fetchFilteredStudents(nextPage)
    lastAppliedKeyRef.current = key
  }

  const loadFiltersFromHistory = () => {
    try {
      const root = window.history.state || {}
      const storeRoot = root.__filters__ || {}
      let reg = storeRoot[location.pathname]
      if (!reg) {
        try {
          const raw = sessionStorage.getItem(PERSIST_KEY)
          if (raw) reg = JSON.parse(raw)
        } catch {}
      }
     // as last resort, parse from URL query params
      if (!reg) {
        const fromUrl = parseFiltersFromSearch(location.search)
        if (fromUrl && (hasAnyFilter(fromUrl.filters))) {
          reg = {
            filters: {
              ...buildPersistableFilters(fromUrl.filters),
              applied: true,
              page: fromUrl.page,
            },
            showPanel: true,
            isFilteredMode: true,
          }
        }
      }
      if (!reg) {
        try {
          const raw2 = sessionStorage.getItem(PERSIST_FALLBACK_KEY)
          if (raw2) reg = JSON.parse(raw2)
        } catch {}
      }
      if (!reg || !reg.filters || !reg.filters.applied) return null
      const parsed = reg.filters
      const makeDate = (v) => {
        if (!v) return null
        try {
          const d = new Date(v)
          return isNaN(d.getTime()) ? null : d
        } catch { return null }
      }
      return {
        filters: {
          certificateId: parsed.certificateId || '',
          batchName: parsed.batchName || '',
          courseName: parsed.courseName || '',
          branchName: parsed.branchName || '',
          startDate: makeDate(parsed.startDate),
          endDate: makeDate(parsed.endDate),
        },
        page: typeof parsed.page === 'number' ? parsed.page : 1,
        showPanel: typeof reg.showPanel === 'boolean' ? reg.showPanel : true,
        isFilteredMode: typeof reg.isFilteredMode === 'boolean' ? reg.isFilteredMode : true,
      }
    } catch { return null }
  }

  const clearHistoryFilters = () => {
    try {
      const prev = window.history.state || {}
    const storeRoot = { ...(prev.__filters__ || {}) }
    delete storeRoot[location.pathname]
    const next = { ...prev, __filters__: storeRoot }
      window.history.replaceState(next, document.title, window.location.href)
   try {
        sessionStorage.removeItem(PERSIST_KEY)
        sessionStorage.removeItem(PERSIST_FALLBACK_KEY)
      } catch {}
      try {
        if (location.search) navigate({ search: '' }, { replace: true })
      } catch {}
      // try {
      //   if (location.search) navigate({ search: '' }, { replace: true })
      // } catch {}
    } catch {}
  }

  const hasAnyFilter = (f) => {
    if (!f) return false
    const textVal = (v) => {
      if (v && typeof v === 'object') return (v.value || '').trim()
      return (v || '').toString().trim()
    }
    return Boolean(
      textVal(f.certificateId) ||
      textVal(f.batchName) ||
      textVal(f.courseName) ||
      textVal(f.branchName) ||
      f.startDate || f.endDate
    )
  }

  const buildFilterParams = (pageVal) => {
    const f = studentFilter
    const params = { page: pageVal || 1, limit }
    const getVal = (v) => (v && typeof v === 'object') ? (v.value ?? '') : v
    if (getVal(f.certificateId)) params.certificateId = getVal(f.certificateId)
    if (getVal(f.batchName)) params.batchName = getVal(f.batchName)
    if (getVal(f.courseName)) params.courseName = getVal(f.courseName)
    if (getVal(f.branchName)) params.branchName = getVal(f.branchName)
    if (f.startDate) params.startDate = toISODate(f.startDate)
    if (f.endDate) params.endDate = toISODate(f.endDate)
    return params
  }

  const fetchFilteredStudents = async (pageVal) => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/student/filter-students`, {
        params: buildFilterParams(pageVal || currentPage),
      })
      const data = response.data
      if (data?.success) {
        const list = data.students || []
        setStudents(list)
        const total = Number(data.totalCount || 0)
        setTotalPages(Math.max(1, Math.ceil(total / limit)))
      } else {
        toast.error(data?.message || 'No results found')
        setStudents([])
        setTotalPages(1)
      }
    } catch (err) {
      setStudents([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyStudentFilter = () => {
    const active = hasAnyFilter(studentFilter)
    setIsFilteredMode(active)
    const nextPage = 1
    setCurrentPage(nextPage)
    if (active) {
    saveFiltersToHistory(studentFilter, { page: nextPage, isFilteredMode: true, showPanel: false })
  try { console.debug('[studentFilters][history] applied ->', studentFilter) } catch(e) {}
      fetchFilteredStudents(nextPage)
      toast.success('Filters applied')
    } else {
    clearHistoryFilters()
      fetchStudents(1)
    }
  // follow BatchDetails UX: hide the filter panel after applying filters
  setShowStudentFilter(false)
  }

  const handleClearStudentFilter = () => {
    setStudentFilter({
      certificateId: '',
      batchName: '',
      courseName: '',
      branchName: '',
      startDate: null,
      endDate: null,
    })
    setIsFilteredMode(false)
    setCurrentPage(1)
  clearHistoryFilters()
    fetchStudents(1)
  }

  // Handle toggle between edit and save
  // Effect to initialize student data when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      setStudentData({ ...selectedStudent }) // Create a copy to avoid mutating the original
    }
  }, [selectedStudent])


  useEffect(() => {
    // Load saved filters (from history.state) on first mount
    const saved = loadFiltersFromHistory()
    if (saved && (saved.isFilteredMode || hasAnyFilter(saved.filters))) {
      setStudentFilter(saved.filters)
      setIsFilteredMode(true)
      setShowStudentFilter(Boolean(saved.showPanel))
      const pageToUse = hasAnyFilter(saved.filters) ? (saved.page || 1) : 1
      try {
        const desired = buildSearchFromFilters(saved.filters, pageToUse)
        if (location.search !== desired) navigate({ search: desired }, { replace: true })
      } catch {}
      setCurrentPage(pageToUse)
      fetchFilteredStudents(pageToUse)
      return
    }
  // If UI already shows filters but not applied yet, auto-apply silently
  if (!isFilteredMode && hasAnyFilter(studentFilter)) {
      applyFiltersSilently()
      return
    }
    fetchStudents(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // One-time auto-apply guard: if filters appear (restored) but mode isn't active yet, auto-apply
  const didAutoApplyRef = useRef(false)
  useEffect(() => {
    if (didAutoApplyRef.current) return
    if (!isFilteredMode && hasAnyFilter(studentFilter)) {
      didAutoApplyRef.current = true
      applyFiltersSilently()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentFilter, isFilteredMode])

  // Auto-apply on any filter field change (debounced), and auto-clear when fields are emptied
  useEffect(() => {
    if (autoApplyDebounceRef.current) clearTimeout(autoApplyDebounceRef.current)
    if (!hasAnyFilter(studentFilter)) {
      // if no filters remain but mode is active, clear automatically
      if (isFilteredMode) handleClearStudentFilter()
      return
    }
    autoApplyDebounceRef.current = setTimeout(() => {
      applyFiltersSilently()
    }, 300)
    return () => {
      if (autoApplyDebounceRef.current) clearTimeout(autoApplyDebounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentFilter])

  // Re-fetch on deps change. If user is actively searching, run search results (bypass filtered fetch)
  useEffect(() => {
    const hasSearch = Boolean((searchTerm || '').toString().trim()) && isSearchActive
    if (hasSearch) {
      // when user is typing a search, show search results regardless of filtered mode
      fetchSearchResults(currentPage)
      return
    }
    if (isFilteredMode) {
      fetchFilteredStudents(currentPage)
    } else {
      fetchStudents(currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, dateFrom, dateTo, isFilteredMode, isSearchActive])

  // Keep history.state in sync while filters are active (page/panel)
  useEffect(() => {
    if (isFilteredMode) {
      try { saveFiltersToHistory(studentFilter, { page: currentPage, showPanel: showStudentFilter, isFilteredMode }) } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isFilteredMode, studentFilter, showStudentFilter])


  const handleChangeStudent = (e) => {
    const { name, value } = e.target
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value, // Update the respective field
    }))
  }

  const handleFileChange = (e, fileType) => {
    setSelectedFiles({
      ...selectedFiles,
      [fileType]: e.target.files[0], // Save the selected file
    })
  }

  //handle edit
  const handleIsEdit = () => {
    setIsEditMode(!isEditMode)
  }

  //update student details
  const handleUpdate = async (studentData) => {
    const frmData = new FormData()
    frmData.append('name', formatName(studentData?.name))
    frmData.append('email', normalizeEmail(studentData?.email))
    frmData.append('mobile', studentData?.mobile)
    frmData.append('dob', studentData?.dob)
    frmData.append('gender', studentData?.gender)
    frmData.append('address', studentData?.address)
    frmData.append('occupation', studentData?.occupation)
    frmData.append('qualification', studentData?.qualification)
    frmData.append('bloodGrp', studentData?.bloodGrp)
    frmData.append('profileImage', selectedFiles.imagePath)
    frmData.append('aadharImage', selectedFiles.adhaarImage)

    try {
      const response = await axios.put(
        `${BASE_URL}/student/updateStudById/${studentData.studentId}`,
        frmData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      const respData = response.data
      if (respData?.success) {
        toast.success(respData?.message || 'Detail update successfully', { position: 'top-center' })
        setIsEditMode(!isEditMode)
        setViewModal(false)
        fetchStudents(currentPage)
      } else {
        toast.error(respData?.message || 'Fail to update details')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error. Tyr after some time.')
    }
  }

  //import student via excel
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Utility: parse various date formats into ISO




    function parseDateString(input) {
      const MONTHS = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
      };
      if (input == null || input === '') {
        throw new Error('Empty date');
      }

      // 1. If it's a number or a pure-digit string → Excel serial
      if (
        typeof input === 'number' ||
        (typeof input === 'string' && /^\d+$/.test(input))
      ) {
        const serial = Number(input);
        // Format as dd/mm/yyyy via SheetJS
        const formatted = XLSX.SSF.format('dd/mm/yyyy', serial);
        // split and re-join as dd-mm-yyyy
        const [d, m, y] = formatted.split('/');
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
      }

      // normalize to string
      let s = input.toString().trim();

      // 2. Numeric dates: dd[-/.]mm[-/.]yyyy or yy
      const numericRe = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/;
      let m = s.match(numericRe);
      if (m) {
        let [, d, mo, y] = m;
        if (y.length === 2) y = '20' + y;
        d = d.padStart(2, '0');
        mo = mo.padStart(2, '0');
        if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12 || y.length !== 4) {
          throw new Error(`Invalid numeric date parts: ${s}`);
        }
        return `${d}-${mo}-${y}`;
      }

      // 3. Alpha-month dates: “7 Mar 2000” or “07 March 00”
      const alphaRe = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/;
      m = s.match(alphaRe);
      if (m) {
        let [, d, mon, y] = m;
        const key = mon.substr(0, 3).toLowerCase();
        const moNum = MONTHS[key];
        if (!moNum) throw new Error(`Unknown month: ${mon}`);
        if (y.length === 2) y = '20' + y;
        d = d.padStart(2, '0');
        const mo = String(moNum).padStart(2, '0');
        if (+d < 1 || +d > 31 || y.length !== 4) {
          throw new Error(`Invalid alpha date parts: ${s}`);
        }
        return `${d}-${mo}-${y}`;
      }

      // 4. Fallback to JS Date
      const dt = new Date(s);
      if (isNaN(dt.getTime())) {
        throw new Error(`Cannot parse date: "${s}"`);
      }
      const d = String(dt.getDate()).padStart(2, '0');
      const mo = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}-${mo}-${y}`;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const [header, ...dataRows] = rows;

      // Build header map
      const headerMap = header.reduce((m, col, idx) => ({ ...m, [col.trim().toLowerCase()]: idx }), {});
      const requiredCols = ['name', 'email', 'dob', 'gender', 'mobile', 'occupation', 'qualification', 'address', 'bloodgrp'];
      for (const col of requiredCols) {
        if (!(col in headerMap)) {
          toast.error(`Missing column: ${col}`);
          return;
        }
      }

      // Preload existing emails/mobiles
      let existingEmails = new Set(), existingMobiles = new Set();
      try {
        const res = await axios.get(`${BASE_URL}/student/registered-students`);
        const studs = res.data.students || [];
        existingEmails = new Set(studs.map(s => s.email?.toLowerCase()));
        existingMobiles = new Set(studs.map(s => String(s.mobile)));
      } catch {
        toast.error('Could not fetch existing records; duplicate check disabled.');
      }

      const imported = [];
      const failed = [];
      const seenEmails = new Set();
      const seenMobiles = new Set();

      dataRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        // Skip fully empty rows
        const empty = requiredCols.every(c => !String(row[headerMap[c]]).trim());
        if (empty) return;

        const record = {};
        const errs = [];

        // Name
        const nm = String(row[headerMap['name']]).trim();
        if (!nm) errs.push('Name required');
        record.name = nm && formatName(nm);

        // Email
        const em = String(row[headerMap['email']]).trim().toLowerCase();
        if (!em) errs.push('Email required');
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(em)) errs.push('Email invalid');
        else if (seenEmails.has(em) || existingEmails.has(em)) errs.push('Email duplicate');
        record.email = em;

        // DOB
        const db = String(row[headerMap['dob']]).trim();
        try { record.dob = toISODate(parseDateString(db)); }
        catch (ex) { errs.push(`DOB: ${ex.message}`); }

        // Gender
        const gd = String(row[headerMap['gender']]).trim().toLowerCase();
        if (!['male', 'female', 'other'].includes(gd)) errs.push('Gender must be Male/Female/Other');
        record.gender = gd;

        // Mobile
        const mb = String(row[headerMap['mobile']]).trim();
        if (!mb) errs.push('Mobile required');
        else if (!/^[1-9]\d{9}$/.test(mb)) errs.push('Mobile invalid');
        else if (seenMobiles.has(mb) || existingMobiles.has(mb)) errs.push('Mobile duplicate');
        record.mobile = mb;

        // Other optional fields (no strict validation)
        record.occupation = String(row[headerMap['occupation']]).trim();
        record.qualification = String(row[headerMap['qualification']]).trim();
        record.address = String(row[headerMap['address']]).trim();

        // Blood group
        const bg = String(row[headerMap['bloodgrp']]).trim().toUpperCase();
        if (bg && !/^(A|B|AB|O)[+-]$/.test(bg)) errs.push('BloodGrp invalid');
        record.bloodGrp = bg;

        if (errs.length) {
          failed.push({ row: rowNum, errors: errs });
        } else {
          seenEmails.add(em);
          seenMobiles.add(mb);
          imported.push(record);
        }
      });

      // Toast errors per row
      failed.forEach(f => {
        toast.error(`Row ${f.row}: ${f.errors.join(', ')}`, { autoClose: false });
      });

      if (!imported.length) {
        toast.error('No valid records to import');
        return;
      }

      // Send valid records
      try {
        const res = await axios.post(`${BASE_URL}/student/import`, { students: imported });
        if (res.data.success) {
          fetchStudents(currentPage); // Refresh the student list
          toast.success(`Imported ${res.data.students.length} students`);
        }
        else toast.error(res.data.message || 'Server import error');
      } catch (ex) {
        toast.error('Import request failed');
      }

    } catch (e) {
      console.error(e);
      toast.error('Failed to process file. Ensure it is a valid Excel.');
    }
  };

  const handleCloseModal = () => {
    fetchStudents(currentPage); // Refresh the student list when modal is closed
    setShowModal(false);

  }
  const handleShowModal = () => setShowModal(true)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

   const downloadSinglePhoto = async (studentId) => {
  try {
    setIsDownloading(studentId); // show loading on that student

    const response = await axios.get(
      `${BASE_URL}/batch/downloadSinglePhoto/${studentId}`,
      { responseType: 'blob' }
    );

    // try to extract filename from header
    const disposition = response.headers['content-disposition'] || '';
    let filename = `student_${studentId}_photo`;
    const fileNameMatch = disposition.match(/filename\\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/i);
    if (fileNameMatch) {
      filename = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2] || fileNameMatch[3]);
    } else {
      // fallback extension detection
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('jpeg')) filename += '.jpg';
      else if (contentType.includes('png')) filename += '.png';
      else filename += '.jpg';
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading photo:', error);
    toast.error('Failed to download photo.');
  } finally {
    setIsDownloading(''); // stop loading
  }
};

  // Handle deletion of a student
  const handleDelete = async (studentId) => {
    const result = await MySwal.fire({
      title: 'Delete Student Details?',
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
      try {
        const response = await axios.delete(`${BASE_URL}/student/delete-student/${studentId}`)
        const respData = response.data

        if (respData?.success) {
          setStudents((prevStudents) =>
            prevStudents.filter((student) => student.studentId !== studentId),
          )
          toast.success(toast?.message || 'Student deleted successfully!')
          fetchStudents(currentPage)
        } else {
          toast.error(respData?.message || 'Fail to delete student')
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Internal server error. Try after some time.')
      }
    }
  }

  // Format date of birth
  const formatDOB = (dob) => {
    const date = new Date(dob)
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  }

  const handleViewDetails = async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/student/getStudById/${studentId}`)
      const respData = response.data

      if (respData?.success) {
  setSelectedStudent(respData?.studentDtl)
  // fetch enrolled batches for this student
  fetchEnrolledBatches(studentId)
  setViewModal(true)
      } else {
        toast.error(response.data?.message || 'Failed to fetch student details.')
      }
    } catch (error) {
      toast.error('Failed to fetch student details.')
    }
  }

  // Fetch enrolled batch names for the student and store locally for rendering in modal
  const fetchEnrolledBatches = async (studentId) => {
    try {
      const res = await axios.get(`${BASE_URL}/batch/getByStudent/${studentId}`)
      const names = res?.data?.enrolledBatches || []
      setEnrolledBatches(Array.isArray(names) ? names : [])
    } catch (err) {
      setEnrolledBatches([])
    }
  }

  // Open a batch page: fetch batch details (studentIds) then navigate to BatchMembers
  const handleOpenBatch = async (batchId) => {
    if (!batchId) return
    try {
      // close the student modal before navigating
      setViewModal(false)
      const res = await axios.get(`${BASE_URL}/batch/getBatchById/${batchId}`)
      const batchDtl = res?.data?.batchDtl || res?.data?.batch || res?.data || {}
      // studIdsList can be an array of strings or objects; normalize to array of ids
      const studIdsList = Array.isArray(batchDtl?.studentIds)
        ? batchDtl.studentIds.map((it) => (typeof it === 'string' ? it : (it?.studentId || ''))).filter(Boolean)
        : (Array.isArray(batchDtl?.students) ? batchDtl.students.map(s => s.studentId).filter(Boolean) : [])
      // if backend provided a populated students array, use it as fast-path
      const studentsFull = Array.isArray(res?.data?.students) ? res.data.students : (Array.isArray(batchDtl?.students) ? batchDtl.students : null)
      const outgoingBatchName = batchDtl?.batchName || res?.data?.batchName || ''
      // navigate to batchmembers page with student ids, batchId, batchName and optional studentsFull
      navigate('/batchmembers', { state: { studIdsList, batchId, batchName: outgoingBatchName, studentsFull } })
    } catch (err) {
      // fallback: still navigate with only batchId so BatchMembers can try to fetch
      setViewModal(false)
      navigate('/batchmembers', { state: { studIdsList: [], batchId } })
    }
  }

  // Open image in new tab when clicked in modal
  const handleImageClick = (url) => {
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open image', e);
    }
  }

  //handle download excel file
  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await axios.get(`${BASE_URL}/student/downloadExcel`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'SampleExcel.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Error downloading file:')
    } finally {
      setIsDownloading(false)
    }
  }

  //icon stylling start

  const editSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#497AE5',
    color: 'white',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const reUploadSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: 'green',
    color: 'white',
    marginLeft: '4px',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }
  //delete icon
  const delSpan = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItem: 'center',
    background: '#d11a2a',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    marginLeft: '4px',
  }

  //icon stylling end

  // removed duplicate fetch effect; unified above

  const handleCloseeModal = () => {
    setViewModal(false)
    setSelectedStudent(null) // Clear the selected student when modal is closed
  setEnrolledBatches([])
  }

  // Re-upload photo handler
  const handleReuploadPhoto = async (studentId, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('imagePath', file)

    try {
      const response = await axios.put(
        `${BASE_URL}/student/reupload-profile-photo/${studentId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      if (response.data.success) {
        toast.success('Photo re-uploaded! Awaiting admin approval.')
        fetchStudents(currentPage) // or getBatchMembers(currentPage) in BatchMembers.jsx
      } else {
        toast.error(response.data.message || 'Failed to re-upload photo.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Internal server error.')
    }
  }

  const fileInputRefs = useRef({})
  const fileInputRef = useRef({})

  const triggerFileInput = (studentId) => {
    if (fileInputRefs.current[studentId]) {
      fileInputRefs.current[studentId].click()
    }
  }

  const onFileChange = (studentId, e) => {
    const file = e.target.files[0]
    handleReuploadPhoto(studentId, file)
  }

  // --- Import Students from Excel ---
  const handleImportStudent = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mainTableContainer">
      <div className="row mb-4">
        <div className="col-3">

        </div>
        <div className="col-6"><h4 style={{ textAlign: 'center', color: 'black', marginBottom: '3%', fontSize: "28px" }}>
          Registered Student Details
        </h4>
        </div>
        <div className="col-3 d-flex justify-content-end">
          <CustomButton
            title={
              isDownloading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Download Sample'
              )
            }
            icon="Download_w.svg"
            onClick={handleDownload}
          // variant="outline"
          />
        </div>
      </div>

      <div className='row' style={{ marginBottom: '15px', justifyContent: 'space-between', alignItems: 'center' }}>

        <div className="col-lg-7 d-flex justify-content-between">
          <div style={{ width: "35%" }}>
            <InputField
              type="text"
              label="Search By"
              placeholder="Search Name, Email, Mobile"
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val)
                setCurrentPage(1)
                // mark search active when user types; this allows search to bypass filtered mode
                setIsSearchActive(Boolean((val || '').toString().trim()))
              }}
            />
          </div>

          <div>
            <Date_Picker
              label="Start Date"
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val)
                setCurrentPage(1)
              }}
            />
          </div>

          <div>
            <Date_Picker
              label="End Date"
              value={dateTo}
              onChange={(val) => {
                setDateTo(val)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        <div className="col-lg-5 mt-4 d-flex justify-content-end gap-2">

          <CustomButton
            title={showStudentFilter ? 'Hide Filters' : 'Filters'}
            icon="filter_w.svg"
            filterPill
            onClick={() => setShowStudentFilter(s => !s)}
          />


          <CustomButton
            title={
              <>
                {isImporting ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : "Import"}
              </>
            }
            icon="Import_b.svg"
            variant='outline'
            onClick={handleImportStudent}
          />
          <input
            type="file"
            id="importFile"
            accept=".xlsx, .xls"
            onChange={handleImport}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

          <CustomButton
            title={"Register\u00A0Student"}
            onClick={handleShowModal}
            icon="tabler_plus.svg"
          />
        </div>
      </div>

      {showStudentFilter && (
        <div className="row gx-5 gy-2 mt-3 mx-2 py-3 px-5" style={{ background: '#f8f9fc', borderRadius: 8 }}>
          <div className="col-md-3" >
            <InputField
              label="Batch Name"
              type="select"
              hidePlaceholder
              value={studentFilter.batchName}
              onChange={(val) => setStudentFilter((p) => ({ ...p, batchName: val }))}
              options={batchOptions}
              loading={isFilterMetaLoading}
            />
          </div>
          <div className="col-md-3">
            <InputField
              label="Course Name"
              type="select"
              hidePlaceholder
              value={studentFilter.courseName}
              onChange={(val) => setStudentFilter((p) => ({ ...p, courseName: val }))}
              options={courseOptions}
              loading={isFilterMetaLoading}
            />
          </div>
          <div className="col-md-3">
            <InputField
              label="Branch Name"
              type="select"
              hidePlaceholder
              value={studentFilter.branchName}
              onChange={(val) => setStudentFilter((p) => ({ ...p, branchName: val }))}
              options={branchOptions}
              loading={isFilterMetaLoading}
            />
          </div>
          <div className="col-md-3">
            <InputField
              label="Certificate ID"
              type="text"
              value={studentFilter.certificateId}
              onChange={(val) => setStudentFilter((p) => ({ ...p, certificateId: val }))}
            />
          </div>
          <div className="col-md-3">
            <Date_Picker
              label="Batch Start"
              value={studentFilter.startDate}
              onChange={(val) => setStudentFilter((p) => ({ ...p, startDate: val }))}
            />
          </div>
          <div className="col-md-3">
            <Date_Picker
              label="Batch End"
              value={studentFilter.endDate}
              onChange={(val) => setStudentFilter((p) => ({ ...p, endDate: val }))}
            />
          </div>
          <div className="col-md-6 d-flex justify-content-end align-items-end gap-2 mb-1">
            <CustomButton title="Apply" icon="Check.svg" onClick={handleApplyStudentFilter} />
            <CustomButton title="Clear" variant="outline" icon="wrong2.svg" onClick={handleClearStudentFilter} />
          </div>
        </div>
      )}

      <input
        type="file"
        id="importFile"
        accept=".xlsx, .xls"
        onChange={handleImport}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <>
        <div className="table-container mt-4">
          <table className='table table-bordered table-hover align-middle text-center custom-table accessor-table'>
            <thead>
              <tr>
                <th>Sr No</th>
                <th className="special-yellow">Name</th>
                <th className="special-blue">Email</th>
                <th>Mobile</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            {students?.length === 0 ? (
              <div className="">No student available</div>
            ) : (
              <tbody>
                {students.map((student, index) => (
                  <>
                    <tr
                      key={student.email}
                      className='cursor-pointer'
                    >
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{(currentPage - 1) * limit + index + 1}</td>
                      <td className="special-yellow">{student.name}</td>
                      <td className="special-blue">{student.email}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{student.mobile}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{formatDOB(student.dob)}</td>
                      <td style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>{student.gender}</td>
                      <td className="position-relative" style={student.isProfile === "Rejected" ? { backgroundColor: '#ffeaea' } : {}}>
                        <ActionMenu
                          options={[
                            {
                              icon: 'Download_b.svg', // pick your icon file
                              title: 'Download Photo',
                              onClick: () => downloadSinglePhoto(student.studentId),
                              isLoading: isDownloading === student.studentId,
                            },
                            {
                              icon: 'material-symbols_edit-outline.svg',
                              title: 'View Detail',
                              onClick: () => handleViewDetails(student.studentId),
                            },
                            {
                              icon: 'material-symbols_delete-outline.svg',
                              title: 'Delete Student',
                              onClick: () => handleDelete(student.studentId),
                            },
                            ...(student.isProfile !== "Completed"
                              ? [{
                                icon: 'Import_b.svg',
                                title: 'Re-upload Photo',
                                onClick: () => triggerFileInput(student.studentId),
                                customRender: (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={(el) => fileInputRefs.current[student.studentId] = el}
                                    onChange={(e) => onFileChange(student.studentId, e)}
                                  />
                                )
                              }]
                              : []),
                          ].filter(Boolean)}
                        />

                      </td>
                    </tr>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={(el) => fileInputRefs.current[student.studentId] = el}
                      onChange={(e) => onFileChange(student.studentId, e)}
                    />
                  </>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* for view and edit the form  */}

        <Modal show={viewModal} onHide={handleCloseeModal} className="custom-modal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Student Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {studentData ? (
              <Form>
                <div className="row">
                  {/* Name */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Name"
                      type="text"
                      value={studentData.name}
                      onChange={(val) => handleChangeStudent({ target: { name: 'name', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Email"
                      type="email"
                      value={normalizeEmail(studentData.email)}
                      onChange={(val) => handleChangeStudent({ target: { name: 'email', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Mobile"
                      type="text"
                      value={studentData.mobile}
                      onChange={(val) => handleChangeStudent({ target: { name: 'mobile', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <Date_Picker
                      label="Date of Birth"
                      value={
                        studentData.dob
                          ? new Date(studentData.dob)
                          : null
                      }
                      onChange={(val) => handleChangeStudent({ target: { name: 'dob', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Occupation */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Occupation"
                      type="text"
                      value={studentData.occupation}
                      onChange={(val) => handleChangeStudent({ target: { name: 'occupation', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Address */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Address"
                      type="text"
                      value={studentData.address}
                      onChange={(val) => handleChangeStudent({ target: { name: 'address', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Qualification */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Qualification"
                      type="text"
                      value={studentData.qualification}
                      onChange={(val) => handleChangeStudent({ target: { name: 'qualification', value: val } })}
                      readOnly={!isEditMode}
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Gender"
                      type="select"
                      value={studentData.gender}
                      onChange={(val) => handleChangeStudent({ target: { name: 'gender', value: val } })}
                      disabled={!isEditMode}
                      options={[
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' },
                      ]}
                    />
                  </div>

                  {/* Blood Group */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <InputField
                      label="Blood Group"
                      type="select"
                      value={studentData.bloodGrp}
                      onChange={(val) => handleChangeStudent({ target: { name: 'bloodGrp', value: val } })}
                      disabled={!isEditMode}
                      options={[
                        { label: 'Select', value: '' },
                        { label: 'A+', value: 'A+' },
                        { label: 'A-', value: 'A-' },
                        { label: 'B+', value: 'B+' },
                        { label: 'B-', value: 'B-' },
                        { label: 'O+', value: 'O+' },
                        { label: 'O-', value: 'O-' },
                        { label: 'AB+', value: 'AB+' },
                        { label: 'AB-', value: 'AB-' },
                      ]}
                    />
                  </div>

                  {/* Profile Photo */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <label><strong>Profile Photo:</strong></label>
                    <div className="row d-flex align-items-center">
                      {studentData.imagePath && (
                        <img
                          src={`${BASE_URL}/${studentData.imagePath}`}
                          alt="Profile"
                          style={{ width: 'auto', height: '120px', marginRight: '10px', cursor: 'pointer' }}
                          onClick={() => handleImageClick(`${BASE_URL}/${studentData.imagePath}`)}
                        />
                      )}
                      {isEditMode && (
                        <div className="col-12">
                          <InputField
                            type="file"
                            name="imagePath"
                            onChange={(e) => handleFileChange(e, 'imagePath')}
                            accept="image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Image */}
                  <div className="col-md-6 col-lg-4 px-4 pb-4">
                    <label><strong>Aadhaar Card:</strong></label>
                    <div className="d-flex align-items-center">
                      {studentData.adhaarImage && (
                        <img
                          src={`${BASE_URL}/${studentData.adhaarImage}`}
                          alt="Aadhaar Card"
                          style={{ width: 'auto', height: '120px', marginRight: '10px', cursor: 'pointer' }}
                          onClick={() => handleImageClick(`${BASE_URL}/${studentData.adhaarImage}`)}
                        />
                      )}
                      {isEditMode && (
                        <div className="col-12">
                          <InputField
                            type="file"
                            name="adhaarImage"
                            onChange={(e) => handleFileChange(e, 'adhaarImage')}
                            accept="application/pdf, image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enrolled Batches */}
                  <div className="col-12 px-4 pb-4">
                    <label><strong>Enrolled Batches:</strong></label>
                    <div style={{ marginTop: 6 }}>
                      {enrolledBatches && enrolledBatches.length > 0 ? (
                        enrolledBatches.map((b, idx) => {
                          // Support both legacy string entries and newer object entries from the backend
                          const name = typeof b === 'string'
                            ? b
                            : (b && (b.batchName || b.name || b.batch || b.batchTitle)) || '';
                          const key = (b && (b._id || b.batchId)) || idx;
                          const clickable = name && (b && (b._id || b.batchId))
                          return (
                            <span
                              key={key}
                              className="badge me-2 mb-2 batch-badge"
                              style={{
                                cursor: clickable ? 'pointer' : 'default',
                                fontSize: '12px',
                                letterSpacing: '.2px',
                                backgroundColor: clickable ? '#1F3F89' : '#6c757d',
                                color: '#fff'
                              }}
                              role={clickable ? 'button' : undefined}
                              tabIndex={clickable ? 0 : undefined}
                              onClick={() => { if (clickable) handleOpenBatch(b._id || b.batchId) }}
                              onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) handleOpenBatch(b._id || b.batchId) }}
                            >
                              {name || 'Unnamed'}
                            </span>
                          )
                        })
                      ) : (
                        <div style={{ color: '#6c757d' }}>Not enrolled in any batch</div>
                      )}
                    </div>
                  </div>
                </div>
              </Form>

            ) : (
              <p>Loading...</p>
            )}
            <div className="d-flex justify-content-end mt-4 mb-2 px-4 pb-4">
              <CustomButton
                title={isEditMode ? 'Save Changes' : 'Edit'}
                icon={isEditMode ? 'Save_w.svg' : 'Edit_Pencil_w.svg'}
                onClick={() => {
                  if (isEditMode) {
                    handleUpdate(studentData)
                  } else {
                    handleIsEdit()
                  }
                }}
              />
            </div>
          </Modal.Body>
        </Modal>

        {/* for student registration  */}

        <Modal show={showModal} onHide={handleCloseModal} className="custom-modal" size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Register Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RegisterStudentForm />
          </Modal.Body>
        </Modal>
      </>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{ duration: 2000 }}
      />
    </div>
  )
}

export default RegisteredStudentsTable
