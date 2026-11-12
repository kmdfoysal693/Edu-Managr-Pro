import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shareholder } from '../../types';
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
  Layers,
  Sparkles,
  CheckCircle,
  Coins,
  Percent,
  Award,
  Crown,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

interface ShareholderIdCardModalProps {
  shareholder: Shareholder | null;
  onClose: () => void;
}

export const ShareholderIdCardModal: React.FC<ShareholderIdCardModalProps> = ({
  shareholder,
  onClose,
}) => {
  const { schoolSettings } = useSchool();
  const [viewMode, setViewMode] = useState<'both' | 'front' | 'back'>('both');

  if (!shareholder) return null;

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  // Unique QR payload for this specific shareholder / trustee
  const qrPayload = JSON.stringify({
    institution: schoolSettings.institutionName || schoolSettings.schoolName,
    eiin: schoolSettings.eiin,
    type: 'Board of Trustees & Shareholder Member',
    memberId: shareholder.id,
    name: shareholder.fullName,
    shares: shareholder.numberOfShares,
    equityStake: `${shareholder.sharePercentage || 10}%`,
    capitalInvestment: `BDT ${shareholder.shareAmount}`,
    phone: shareholder.phoneNumber,
    email: shareholder.email,
    memberSince: shareholder.joiningDate,
    status: shareholder.status,
    verificationToken: `SEC-SH-${shareholder.id}-${shareholder.numberOfShares}`,
  });

  const handlePrint = () => {
    printElement('printable-shareholder-id-card', {
      title: `Shareholder-ID-${shareholder.id}`,
      pageSize: 'A4',
      orientation: 'landscape',
    });
  };

  return (
    <Modal
      isOpen={Boolean(shareholder)}
      onClose={onClose}
      title="Shareholder & Trustee Smart Membership Card"
      subtitle={`Official institutional credential for ${shareholder.fullName} • Member ID: ${shareholder.id}`}
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
                  viewMode === 'both'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both Sides
              </button>
              <button
                type="button"
                onClick={() => setViewMode('front')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'front'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode('back')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'back'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
        <div id="printable-shareholder-id-card" className="print-page flex flex-wrap items-center justify-center gap-8 py-2">
          {/* ======================================================== */}
          {/* FRONT SIDE */}
          {/* ======================================================== */}
          {(viewMode === 'both' || viewMode === 'front') && (
            <div className="flex flex-col items-center">
              <span className="no-print text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2563EB]" /> Front Side
              </span>

              {/* CR80 Standard ID Card Container (~54mm x 85.6mm, 320px x 515px) */}
              <div
                id="shareholder-id-front"
                style={{ width: '320px', minHeight: '515px' }}
                className="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 transition-all select-none"
              >
                {/* Lanyard Hole Punch Slot indicator (hidden in print) */}
                <div className="no-print pt-2 pb-0 flex justify-center">
                  <div className="w-12 h-1.5 bg-slate-300/80 rounded-full border border-slate-400/40" />
                </div>

                {/* Top Executive Institution Banner */}
                <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-blue-950 text-white px-3.5 py-3 text-center relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                    <Crown className="w-20 h-20 text-emerald-400" />
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
                      <h3 className="text-[14px] font-black uppercase tracking-tight leading-tight text-white">
                        {schoolSettings.schoolName}
                      </h3>
                      <p className="text-[8.5px] text-emerald-200 font-medium tracking-wide uppercase truncate max-w-[180px]">
                        {schoolSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-emerald-200 border-t border-emerald-500/20 pt-1 mt-1 font-mono">
                    <span>EIIN: {schoolSettings.eiin}</span>
                    <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded font-sans uppercase tracking-tight flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> TRUSTEE & SHAREHOLDER
                    </span>
                    <span>ESTD: {schoolSettings.establishedYear}</span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="px-4 py-3 flex-1 flex flex-col items-center">
                  {/* Shareholder Photo with Frame */}
                  <div className="relative mb-2.5">
                    <div className="w-24 h-28 rounded-xl overflow-hidden ring-3 ring-emerald-600/60 shadow-md bg-slate-100">
                      <img
                        src={shareholder.photo}
                        alt={shareholder.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Active Status Badge */}
                    <div
                      className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-white text-[9px] font-black shadow-md border-2 border-white flex items-center gap-0.5 uppercase tracking-wider ${
                        shareholder.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-500'
                      }`}
                      title="Stakeholder Status"
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>{shareholder.status}</span>
                    </div>
                  </div>

                  {/* Shareholder Name */}
                  <h4 className="text-sm font-black text-[#172554] tracking-tight text-center leading-tight">
                    {shareholder.fullName}
                  </h4>

                  {/* Portfolio / Role */}
                  <p className="text-xs font-bold text-emerald-800 text-center mt-0.5">
                    {shareholder.notes || 'Governing Trustee & Shareholder'}
                  </p>

                  <div className="mt-1 px-3 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
                    <span className="text-[11px] font-mono font-bold text-emerald-800">
                      MEMBER ID: {shareholder.id}
                    </span>
                  </div>

                  {/* Details Grid Table */}
                  <div className="w-full mt-3 space-y-1.5 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-600" /> Subscribed Shares:
                      </span>
                      <span className="font-bold text-slate-800">
                        {shareholder.numberOfShares} Units
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Percent className="w-3 h-3 text-blue-600" /> Voting Equity Stake:
                      </span>
                      <span className="font-bold text-blue-700">
                        {shareholder.sharePercentage || 10}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Paid Capital:</span>
                      <span className="font-mono text-emerald-700 font-black">
                        {fmtBDT(shareholder.shareAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Phone / Direct:</span>
                      <span className="font-mono text-slate-800 font-semibold">{shareholder.phoneNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1">
                      <span className="text-slate-500 font-medium">Member Since:</span>
                      <span className="font-mono text-slate-700">{shareholder.joiningDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Signature & Verification Bar */}
                <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> ACCREDITED
                    </div>
                    <p className="text-[8px] text-slate-400 mt-0.5">Valid Thru: AGM 2028</p>
                  </div>

                  <div className="text-center">
                    <div className="font-script text-xs text-slate-900 font-black italic">Dr. A. K. Choudhury</div>
                    <div className="w-24 border-b border-slate-700 mx-auto" />
                    <p className="text-[7.5px] font-bold text-slate-700 uppercase mt-0.5">
                      Chairman, Board of Trustees
                    </p>
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

              {/* CR80 Standard ID Card Container */}
              <div
                id="shareholder-id-back"
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
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                      {schoolSettings.schoolName}
                    </h4>
                    <p className="text-[7.5px] text-slate-300 uppercase tracking-widest mt-0.5">
                      TRUSTEE CHARTER & VOTING PROTOCOL
                    </p>
                  </div>
                </div>

                {/* Terms of Membership & Governance */}
                <div className="px-4 py-2.5 text-[9px] text-slate-600 space-y-1.5 leading-relaxed bg-slate-50/70 border-b border-slate-200/80">
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-emerald-700 shrink-0">1.</span>
                    <span>This card certifies official institutional membership in the Board of Trustees and Shareholders.</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-emerald-700 shrink-0">2.</span>
                    <span>Presentation of this card is required to exercise voting rights at the Annual General Meeting (AGM) and board sessions.</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-bold text-emerald-700 shrink-0">3.</span>
                    <span>This card is non-transferable. If lost, notify the Board Secretariat (+880 2 9612345) immediately.</span>
                  </p>
                </div>

                {/* Unique QR Code Area */}
                <div className="px-4 py-3 flex flex-col items-center justify-center flex-1">
                  <div className="p-2.5 bg-white border-2 border-slate-900 rounded-2xl shadow-sm flex flex-col items-center">
                    {/* Authentic Deterministic Scannable QR Code for Shareholder */}
                    <QRCodeSVG
                      value={qrPayload}
                      size={110}
                      level="M"
                      includeMargin={false}
                      className="rounded"
                    />
                    <div className="mt-1.5 px-2 py-0.5 bg-emerald-950 text-emerald-200 rounded text-[7.5px] font-mono tracking-wider font-bold">
                      {shareholder.id} • {shareholder.numberOfShares} SHARES ({shareholder.sharePercentage || 10}%)
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-500 font-semibold mt-1.5 text-center">
                    Scan for AGM Verification, Board Voting & Campus Protocol
                  </p>
                </div>

                {/* Shareholder Registered Address & Board Secretariat Contacts */}
                <div className="px-4 py-2 space-y-1 text-[9.5px] border-t border-slate-200 bg-slate-50/90">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-tight">
                      <strong>Registered Address:</strong> {shareholder.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-mono text-[9px]">
                      <strong>Email:</strong> {shareholder.email}
                    </span>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="px-3.5 py-2 bg-[#172554] text-white text-center text-[8px] leading-tight space-y-0.5">
                  <p className="text-emerald-300 font-medium truncate">
                    If found, please return to: Board Secretariat, {schoolSettings.schoolName}, {schoolSettings.address}
                  </p>
                  <p className="text-slate-400 font-mono">
                    Hotline: {schoolSettings.phone} • Secretariat: {schoolSettings.email}
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
