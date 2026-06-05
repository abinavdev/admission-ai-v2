import React, { useState } from 'react';
import {
  UserPlus, Edit2, Trash2, Shield, Users, UserCheck, Eye,
  Mail, Clock, X, Save,
} from 'lucide-react';
import { teamMembers } from '../data/mockData';
import { TeamMember } from '../types';
import { Modal } from '../components/ui/Modal';

const roleColors: Record<string, string> = {
  Admin: 'bg-purple-50 text-purple-700',
  'Admission Officer': 'bg-blue-50 text-blue-700',
  Viewer: 'bg-slate-100 text-slate-600',
};

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <Shield className="w-3 h-3" />,
  'Admission Officer': <UserCheck className="w-3 h-3" />,
  Viewer: <Eye className="w-3 h-3" />,
};

const permissions: Record<string, string[]> = {
  Admin: ['View Dashboard', 'Manage Leads', 'View Call Logs', 'View Chat History', 'Manage Knowledge Base', 'View Analytics', 'Manage Team', 'Manage Settings', 'API Access'],
  'Admission Officer': ['View Dashboard', 'Manage Leads', 'View Call Logs', 'View Chat History', 'View Knowledge Base', 'View Analytics'],
  Viewer: ['View Dashboard', 'View Leads', 'View Analytics'],
};

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Admission Officer' as TeamMember['role'] });

  const adminCount = members.filter((m) => m.role === 'Admin').length;
  const officerCount = members.filter((m) => m.role === 'Admission Officer').length;
  const activeCount = members.filter((m) => m.status === 'Active').length;

  const handleAdd = () => {
    if (!newMember.name || !newMember.email) return;
    const member: TeamMember = {
      id: `T${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'Active',
      lastLogin: 'Never',
      avatar: newMember.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    };
    setMembers((prev) => [...prev, member]);
    setNewMember({ name: '', email: '', role: 'Admission Officer' });
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length, icon: <Users className="w-5 h-5 text-[#003B7A]" />, bg: 'bg-blue-50' },
          { label: 'Admins', value: adminCount, icon: <Shield className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Admission Officers', value: officerCount, icon: <UserCheck className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Active', value: activeCount, icon: <UserPlus className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">Team Members</h3>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3">
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Member', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[member.role]}`}>
                      {roleIcons[member.role]}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {member.lastLogin}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditMember(member)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-[#003B7A]">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleRemove(member.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 text-sm mb-5">Role Permissions Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-slate-600 font-medium w-48">Permission</th>
                {['Admin', 'Admission Officer', 'Viewer'].map((role) => (
                  <th key={role} className="text-center py-2 px-4 text-slate-600 font-medium">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${roleColors[role]}`}>
                      {roleIcons[role]}
                      {role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions['Admin'].map((perm) => (
                <tr key={perm} className="border-t border-slate-50">
                  <td className="py-2.5 pr-4 text-slate-700">{perm}</td>
                  {['Admin', 'Admission Officer', 'Viewer'].map((role) => (
                    <td key={role} className="py-2.5 px-4 text-center">
                      {permissions[role].some((p) => p.toLowerCase().includes(perm.toLowerCase().split(' ')[1] || perm.toLowerCase().split(' ')[0])) ? (
                        <span className="text-emerald-500 text-base">✓</span>
                      ) : (
                        <span className="text-slate-200 text-base">×</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" placeholder="Dr. Jane Smith" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" placeholder="jane@college.edu" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Role</label>
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamMember['role'] })} className="input">
              <option>Admin</option>
              <option>Admission Officer</option>
              <option>Viewer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="flex-1 btn-outline text-sm">Cancel</button>
            <button onClick={handleAdd} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Team Member" size="sm">
        {editMember && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" defaultValue={editMember.name} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" defaultValue={editMember.email} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Role</label>
              <select defaultValue={editMember.role} className="input">
                <option>Admin</option>
                <option>Admission Officer</option>
                <option>Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
              <select defaultValue={editMember.status} className="input">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditMember(null)} className="flex-1 btn-outline text-sm">Cancel</button>
              <button onClick={() => setEditMember(null)} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
