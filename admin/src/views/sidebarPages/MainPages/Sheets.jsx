import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../../BaseURL'
import toast, { Toaster } from 'react-hot-toast'
import CustomButton from '../../../components/custom/CustomButton'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Sheets page crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid">
          <div className="alert alert-danger mt-3">
            Failed to load Sheets page. Check console for details.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Sheets() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [onlyIssued, setOnlyIssued] = useState(true)
  const [includeDuplicates, setIncludeDuplicates] = useState(true)
  const [sheetCertIds, setSheetCertIds] = useState([]) // certificateIds currently present in Google Sheet

  const formatDate = (val) => {
    if (!val) return ''
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  // Compute ValidDate = issuedDate + validity (months). If invalid inputs, return ''
  const computeValidDate = (issuedDate, validity) => {
    if (!issuedDate || !validity && validity !== 0) return ''
    const base = new Date(issuedDate)
    if (isNaN(base.getTime())) return ''
    const months = Number(validity)
    if (!isFinite(months)) return ''
    const d = new Date(base)
    d.setMonth(d.getMonth() + months)
    return formatDate(d)
  }

  const formatCourseDate = (startDate, endDate) => {
    const s = startDate ? formatDate(startDate) : ''
    const e = endDate ? formatDate(endDate) : ''
    if (s && e) return `${s} - ${e}`
    return s || e || ''
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/issuedCert/allIssueData?onlyIssued=${onlyIssued}&includeDuplicates=${includeDuplicates}`
      const { data } = await axios.get(url)
      if (data?.success) {
        const items = Array.isArray(data.data) ? data.data : []
        const sorted = [...items].sort((a, b) => {
          const aBatch = String(a.batchName || a.batchId || '').toLowerCase()
          const bBatch = String(b.batchName || b.batchId || '').toLowerCase()
          let cmp = aBatch.localeCompare(bBatch, undefined, { numeric: true, sensitivity: 'base' })
          if (cmp !== 0) return cmp
          const aCourse = String(a.courseName || '').toLowerCase()
          const bCourse = String(b.courseName || '').toLowerCase()
          cmp = aCourse.localeCompare(bCourse, undefined, { numeric: true, sensitivity: 'base' })
          if (cmp !== 0) return cmp
          const aCert = String(a.certificateId || '')
          const bCert = String(b.certificateId || '')
          return aCert.localeCompare(bCert, undefined, { numeric: true, sensitivity: 'base' })
        })
        setRows(sorted)
      } else {
        setRows([])
        toast.error(data?.message || 'Failed to load data')
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Server error while loading data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  // Load composite keys (certificateId + courseName) from Sheet1 to detect which DB rows are missing in the sheet
  const loadSheetCertIds = async () => {
    try {
      const { data: sheetData } = await axios.get(`${BASE_URL}/issuedCert/sheets/read`, { params: { sheetName: 'Sheet1' } })
      const grid = Array.isArray(sheetData?.rows) ? sheetData.rows : []
      let ids = []
      if (grid.length > 0) {
        const headerRow = grid[0] || []
        const idxCert = headerRow.findIndex(h => String(h || '').trim().toLowerCase() === 'certificateid')
        const idxCourse = headerRow.findIndex(h => String(h || '').trim().toLowerCase() === 'coursename')
        const certIdx = idxCert >= 0 ? idxCert : 2 // fallback to 3rd column (batchName, courseName, certificateId)
        const courseIdx = idxCourse >= 0 ? idxCourse : 1 // fallback to 2nd column (courseName)
        for (let i = 1; i < grid.length; i++) {
          const row = grid[i] || []
          const cert = (row[certIdx] || '').toString().trim()
          const course = (row[courseIdx] || '').toString().trim().toLowerCase()
          if (cert) ids.push(`${cert}||${course}`)
        }
      }
      setSheetCertIds(ids)
    } catch (err) {
      console.warn('Failed to read existing sheet rows:', err?.message)
      setSheetCertIds([])
    }
  }

  useEffect(() => {
    fetchData()
    loadSheetCertIds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyIssued, includeDuplicates])

  const refreshAll = () => {
    fetchData()
    loadSheetCertIds()
  }

  const appendToSheets = async () => {
    if (!rows.length) return toast.error('No data to append')
    // Build header and values
    const header = [
      'batchName','courseName','certificateId','name','mobile','email','issuedDate','ValidDate','grade','NoOfCandidates','Course Date'
    ]
    // 1) Read existing composite keys (certificateId + courseName) from Google Sheet
    let existingKeys = new Set()
    try {
      const { data: sheetData } = await axios.get(`${BASE_URL}/issuedCert/sheets/read`, { params: { sheetName: 'Sheet1' } })
      const grid = Array.isArray(sheetData?.rows) ? sheetData.rows : []
      if (grid.length > 0) {
        const headerRow = grid[0] || []
        const idxCert = headerRow.findIndex(h => String(h || '').trim().toLowerCase() === 'certificateid')
        const idxCourse = headerRow.findIndex(h => String(h || '').trim().toLowerCase() === 'coursename')
        const certIdx = idxCert >= 0 ? idxCert : 2 // fallback to 3rd column
        const courseIdx = idxCourse >= 0 ? idxCourse : 1 // fallback to 2nd column
        for (let i = 1; i < grid.length; i++) {
          const row = grid[i] || []
          const cert = (row[certIdx] || '').toString().trim()
          const course = (row[courseIdx] || '').toString().trim().toLowerCase()
          if (cert) existingKeys.add(`${cert}||${course}`)
        }
      }
    } catch (err) {
      // proceed with empty existingKeys on read error
      console.warn('Failed to read existing sheet rows:', err?.message)
    }

    // 2) Filter current rows to only new composite keys (and non-empty cert)
    const seenThisRun = new Set()
    let newRows = rows.filter(r => {
      const id = (r.certificateId || '').toString().trim()
      const course = (r.courseName || '').toString().trim().toLowerCase()
      if (!id) return false
      const key = `${id}||${course}`
      if (existingKeys.has(key)) return false
      if (seenThisRun.has(key)) return false
      seenThisRun.add(key)
      return true
    })

    // Sort append list batchwise as well
    newRows = newRows.sort((a, b) => {
      const aBatch = String(a.batchName || a.batchId || '').toLowerCase()
      const bBatch = String(b.batchName || b.batchId || '').toLowerCase()
      let cmp = aBatch.localeCompare(bBatch, undefined, { numeric: true, sensitivity: 'base' })
      if (cmp !== 0) return cmp
      const aCourse = String(a.courseName || '').toLowerCase()
      const bCourse = String(b.courseName || '').toLowerCase()
      cmp = aCourse.localeCompare(bCourse, undefined, { numeric: true, sensitivity: 'base' })
      if (cmp !== 0) return cmp
      const aCert = String(a.certificateId || '')
      const bCert = String(b.certificateId || '')
      return aCert.localeCompare(bCert, undefined, { numeric: true, sensitivity: 'base' })
    })

    if (!newRows.length) {
      return toast.success('Nothing new to append')
    }

    // Precompute batch counts for NoOfCandidates
    const batchCounts = new Map()
    rows.forEach(x => {
      const key = x.batchId || '__'
      batchCounts.set(key, (batchCounts.get(key) || 0) + 1)
    })

    const bodyRows = newRows.map(r => {
      const issued = formatDate(r.issuedDate) || ''
      const valid = computeValidDate(r.issuedDate, r.validity)
      const courseDate = formatCourseDate(r.startDate, r.endDate)
      const count = batchCounts.get(r.batchId || '__') || ''
      return [
        r.batchName||'',
        r.courseName||'',
        r.certificateId||'',
        r.name||'',
        r.mobile||'',
        r.email||'',
        issued,
        valid,
        r.grade||'',
        count,
        courseDate,
      ]
    })

    try {
      // First, ensure header exists by updating first row
      await axios.post(`${BASE_URL}/issuedCert/sheets/updateRange`, {
        range: 'Sheet1!A1',
        values: [header],
        valueInputOption: 'USER_ENTERED'
      })
      // Then append the data rows at the end of the sheet
    const resp = await axios.post(`${BASE_URL}/issuedCert/sheets/appendRows`, {
        sheetName: 'Sheet1',
        rows: bodyRows,
        valueInputOption: 'USER_ENTERED'
      })
    toast.success(`Appended ${bodyRows.length} new row(s) to Google Sheets`)
    // Refresh sheet ids so the indicators update immediately
    await loadSheetCertIds()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Failed to append to Google Sheets')
    }
  }

  // Composite keys set from sheet (certificateId||courseNameLower)
  const sheetIdSet = useMemo(() => new Set((sheetCertIds || []).map(x => String(x))), [sheetCertIds])

  const cols = useMemo(() => ([
    { key: 'certificateId', label: 'Certificate ID' },
    // { key: 'studentId', label: 'Student ID' },
    { key: 'name', label: 'Name' },
  { key: 'batchName', label: 'Batch' },
    { key: 'courseName', label: 'Course' },
    { key: 'grade', label: 'Grade' },
    { key: 'meterDive', label: 'Meter Dive' },
    { key: 'issued', label: 'Issued' },
    { key: 'issuedDate', label: 'Issued Date' },
  ]), [])

  return (
    <ErrorBoundary>
    <div className="container-fluid">
      <Toaster position="top-center" reverseOrder={true} />
      <div className="d-flex align-items-center justify-content-between my-3">
        <h4 style={{ margin: 0 }}>Sheets</h4>
        <div className="d-flex gap-2">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="onlyIssued" checked={onlyIssued} onChange={() => setOnlyIssued(v => !v)} />
            <label className="form-check-label" htmlFor="onlyIssued">Only Issued</label>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="includeDup" checked={includeDuplicates} onChange={() => setIncludeDuplicates(v => !v)} />
            <label className="form-check-label" htmlFor="includeDup">Show Duplicates</label>
          </div>
          <CustomButton title={loading ? 'Loading...' : 'Refresh'} variant="outline" icon="Import_b.svg" onClick={refreshAll} disabled={loading} />
          <CustomButton title="Append" icon="Save_w.svg" onClick={appendToSheets} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ width: 24 }}></th>
              {cols.map(c => (<th key={c.key}>{c.label}</th>))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {(() => {
                  const id = String(r?.certificateId || '').trim()
                  const course = String(r?.courseName || '').trim().toLowerCase()
                  const key = id ? `${id}||${course}` : ''
                  const isMissingInSheet = key && !sheetIdSet.has(key)
                  return (
                    <td>
                      {isMissingInSheet ? (
                        <span
                          title="Not in Google Sheet"
                          style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: 'green' }}
                        />
                      ) : null}
                    </td>
                  )
                })()}
                {cols.map(c => {
                  const value = c.key === 'issuedDate' ? formatDate(r[c.key]) : r[c.key]
                  return <td key={c.key}>{String(value ?? '')}</td>
                })}
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={cols.length + 1} className="text-center">{loading ? 'Loading...' : 'No data'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </ErrorBoundary>
  )
}
