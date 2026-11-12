import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StaffMember } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useSchool } from '../../context/SchoolContext';
import {
  Printer,
  School,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle,
  Building2,
  Award,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

interface StaffIdCardModalProps {
  staff: StaffMember | null;
  onClose: () => void;
}

export const StaffIdCardModal: React.FC<StaffIdCardModalProps> = ({ staff, onClose }) => {
  const { schoolSettings } = useSchool();
  const [viewMode, setViewMode] = useState<'both' | 'front' | 'back'>('both');

  if (!staff) return null;

  // Unique QR payload for this specific staff member
  const qrPayload = JSON.stringify({
    institution: schoolSettings.institutionName || schoolSettings.schoolName,
    eiin: schoolSettings.eiin,
    staffId: staff.staffId,
    name: staff.fullName,
    designation: staff.designation,
    department: staff.department,
    phone: staff.phoneNumber,
    email: staff.email,
    emergencyPhone: staff.emergencyContact?.phone || schoolSettings.phone,
    employmentStatus: staff.employmentStatus,
    joiningDate: staff.joiningDate,
    securityToken: `SEC-STF-${staff.id.toUpperCase()}-${staff.staffId}`,
  });

  const handlePrint = () => {
    printElement('printable-staff-id-card', {
      title: `Staff-ID-${staff.staffId}`,
      pageSize: 'A4',
      orientation: 'landscape',
    });
  };

  return (
    <Modal
      isOpen={Boolean(staff)}
      onClose={onClose}
      title="Faculty & Staff Smart ID Card"
      subtitle={`Official institutional credential for ${staff.fullName} • ID: ${staff.staffId}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Controls Toolbar (Hidden in print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> View Side:
            </span>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'both' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both Sides
              </button>
              <button
                type="button"
                onClick={() => setViewMode('front')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'front' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode('back')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'back' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Only
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
              Print ID Card
            </Button>
          </div>
        </div>

        {/* Printable ID Card Container */}
        <div id="printable-staff-id-card" className="print-page flex flex-wrap items-center justify-center gap-8 py-2">
          {/* ======================================================== */}
          {/* FRONT SIDE */}
          {/* ======================================================== */}
          {(viewMode === 'both' || viewMode === 'front') && (
            <div className="flex flex-col items-center">
              <span className="no-print text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB]" /> Front Side
              </span>

              {/* CR80 Standard ID Card Aspect Ratio Container (~54mm x 85.6mm, 320px x 515px) */}
              <div
                id="staff-id-front"
                style={{ width: '320px', minHeight: '515px' }}
                className="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 transition-all select-none"
              >
                {/* Lanyard Hole Punch Slot indicator (hidden in print) */}
                <div className="no-print pt-2 pb-0 flex justify-center">
                  <div className="w-12 h-1.5 bg-slate-300/80 rounded-full border border-slate-400/40" />
                </div>

                {/* Top Institution Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white px-3.5 py-3 text-center relative overflow-hidden">
                  {/* Subtle background decoration */}
                  <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                    <School className="w-20 h-20 text-white" />
                  </div>

                  <div className="flex items-center justify-center gap-2.5 mb-1">
                    <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-xs ring-1 ring-white/60 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={schoolSettings.logo}
                        alt={`${schoolSettings.schoolName} Logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[14px] font-black uppercase tracking-tight leading-tight">
                        {schoolSettings.schoolName}
                      </h3>
                      <p className="text-[8.5px] text-blue-200 font-medium tracking-wide uppercase truncate max-w-[180px]">
                        {schoolSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-blue-200 border-t border-white/20 pt-1 mt-1 font-mono">
                    <span>EIIN: {schoolSettings.eiin}</span>
                    <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded font-sans uppercase">
                      FACULTY & EMPLOYEE ID
                    </span>
                    <span>ESTD: {schoolSettings.establishedYear}</span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="px-4 py-3 flex-1 flex flex-col items-center">
                  {/* Staff Photo with Frame */}
                  <div className="relative mb-2.5">
                    <div className="w-24 h-28 rounded-xl overflow-hidden ring-3 ring-blue-700/50 shadow-md bg-slate-100">
                      <img
                        src={staff.photo}
                        alt={staff.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Employment Status Badge */}
                    <div
                      className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black shadow-md border-2 border-white flex items-center gap-0.5 uppercase tracking-wider"
                      title="Employment Status"
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>{staff.employmentStatus}</span>
                    </div>
                  </div>

                  {/* Staff Name */}
                  <h4 className="text-sm font-black text-[#172554] tracking-tight text-center leading-tight">
                    {staff.fullName}
                  </h4>

                  {/* Designation & Staff ID */}
                  <p className="text-xs font-bold text-blue-700 text-center mt-0.5">
                    {staff.designation}
                  </p>

                  <div className="mt-1 px-3 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
                    <span className="text-[11px] font-mono font-bold text-[#2563EB]">
                      ID: {staff.staffId}
                    </span>
                  </div>

                  {/* Details Grid Table */}
                  <div className="w-full mt-3 space-y-1.5 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">
                        {staff.department}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Official Email:</span>
                      <span className="font-mono text-slate-700 text-[10px] truncate max-w-[150px]">{staff.email}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Contact Tel:</span>
                      <span className="font-mono text-slate-800 font-semibold">{staff.phoneNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Appointment Date:</span>
                      <span className="font-mono text-slate-700">{staff.joiningDate}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Gender / DOB:</span>
                      <span className="font-semibold text-slate-700">
                        {staff.gender} • {staff.dateOfBirth}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Signature & Verification Bar */}
                <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      <ShieldCheck className="w-3 h-3 text-[#2563EB]" /> AUTHORIZED
                    </div>
                    <p className="text-[8px] text-slate-400 mt-0.5">Valid Thru: Dec 2027</p>
                  </div>

                  <div className="text-center">
                    <div className="font-script text-xs text-blue-900 font-black italic">Prof. M. Rahman</div>
                    <div className="w-20 border-b border-slate-700 mx-auto" />
                    <p className="text-[8px] font-bold text-slate-700 uppercase mt-0.5">Principal</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* BACK SIDE (Unique QR Code) */}
          {/* ======================================================== */}
          {(viewMode === 'both' || viewMode === 'back') && (
            <div className="flex flex-col items-center">
              <span className="no-print text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB]" /> Back Side (Unique QR)
              </span>

              {/* CR80 Standard ID Card Aspect Ratio Container */}
              <div
                id="staff-id-back"
                style={{ width: '320px', minHeight: '515px' }}
                className="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 transition-all select-none"
              >
                {/* Lanyard Hole Punch Slot indicator (hidden in print) */}
                <div className="no-print pt-2 pb-0 flex justify-center">
                  <div className="w-12 h-1.5 bg-slate-300/80 rounded-full border border-slate-400/40" />
                </div>

                {/* Back Top Banner */}
                <div className="bg-[#172554] text-white px-3 py-2 text-center border-b border-blue-900 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={schoolSettings.logo}
                      alt={`${schoolSettings.schoolName} Logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-200">
                      {schoolSettings.schoolName}
                    </h4>
                    <p className="text-[7.5px] text-slate-300 uppercase tracking-widest mt-0.5">
                      STAFF CODE OF CONDUCT & SECURITY PROTOCOL
                    </p>
                  </div>
                </div>

                {/* Terms of Use */}
                <div className="px-4 py-2.5 text-[9px] text-slate-600 space-y-1.5 leading-relaxed bg-slate-50/70 border-b border-slate-200/80">
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-[#2563EB] shrink-0">1.</span>
                    <span>This card is the property of the institution and must be displayed at all times on campus.</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-[#2563EB] shrink-0">2.</span>
                    <span>This card is non-transferable. Report loss or damage immediately to the administrative office.</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-[#2563EB] shrink-0">3.</span>
                    <span>Use the unique QR code for biometric attendance verification and digital campus access.</span>
                  </p>
                </div>

                {/* Unique QR Code Area */}
                <div className="px-4 py-3 flex flex-col items-center justify-center flex-1">
                  <div className="p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-sm flex flex-col items-center">
                    {/* Authentic Deterministic Scannable QR Code for Staff */}
                    <QRCodeSVG
                      value={qrPayload}
                      size={110}
                      level="M"
                      includeMargin={false}
                      className="rounded"
                    />
                    <div className="mt-1.5 px-2 py-0.5 bg-slate-900 text-white rounded text-[7.5px] font-mono tracking-wider font-bold">
                      {staff.staffId} • {staff.department.toUpperCase().slice(0, 15)}
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-500 font-semibold mt-1.5 text-center">
                    Scan for Staff Biometric Attendance & Gate Entry
                  </p>
                </div>

                {/* Staff Address & Emergency Contacts */}
                <div className="px-4 py-2 space-y-1 text-[9.5px] border-t border-slate-200 bg-slate-50/90">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-tight">
                      <strong>Address:</strong> {staff.address}
                    </span>
                  </div>

                  {staff.emergencyContact && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-mono">
                        <strong>Emergency:</strong> {staff.emergencyContact.name} ({staff.emergencyContact.relation}) • {staff.emergencyContact.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Back Footer */}
                <div className="px-3.5 py-2 bg-[#172554] text-white text-center text-[8px] leading-tight space-y-0.5">
                  <p className="text-blue-200 font-medium truncate">
                    If found, please return to: {schoolSettings.schoolName}, {schoolSettings.address}
                  </p>
                  <p className="text-slate-400 font-mono">
                    Tel: {schoolSettings.phone} • Email: {schoolSettings.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer (Hidden in print) */}
        <div className="no-print pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            CR80 Standard PVC Dimensions (54mm x 85.6mm) • Scannable Dynamic QR Pass
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
              Print ID Card
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
