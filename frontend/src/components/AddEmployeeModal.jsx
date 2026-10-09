import { useState } from 'react';

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    branch: 'Head Office',
    shift: 'Morning',
    role: 'employee',
    status: 'Active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    onAddEmployee({
      ...form,
      employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    });

    setForm({
      name: '',
      email: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      branch: 'Head Office',
      shift: 'Morning',
      role: 'employee',
      status: 'Active',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Add New Employee</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create workforce account & assign department</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@company.com" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Support">Support</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. UI Designer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange}>
                <option value="Head Office">Head Office</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Shift</label>
              <select name="shift" value={form.shift} onChange={handleChange}>
                <option value="Morning">Morning (9 AM - 6 PM)</option>
                <option value="Evening">Evening (2 PM - 11 PM)</option>
                <option value="Night">Night (10 PM - 7 AM)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="manager">Manager / HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}
