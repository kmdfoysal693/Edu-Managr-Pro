import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { QRAttendanceLog } from '../../types';
import {
  QrCode,
  Scan,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  School,
  ArrowRight,
  ShieldCheck,
  Search,
  UserCheck,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const QRAttendance: React.FC = () => {
  const { students, staff, qrLogs, recordQRScan, schoolSettings } = useSchool();

  const [scanInput, setScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: string;
  }>({
    status: 'idle',
    message: 'Scanner Ready: Point barcode/QR scanner or enter ID below',
  });

  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // QR Pass modal
  const [selectedPersonForCard, setSelectedPersonForCard] = useState<{
    name: string;
    id: string;
    type: 'Student' | 'Staff';
    photo: string;
    roleOrClass: string;
    phone?: string;
  } | null>(null);

  // Play audio chime on scan
  const playScanChime = (success: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (success) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio not permitted without interaction
    }
  };

  const handleProcessScan = (idToProcess: string) => {
    if (!idToProcess.trim()) return;
    const result = recordQRScan(idToProcess);
    if (result.success) {
      playScanChime(true);
      setScanFeedback({
        status: 'success',
        message: 'ATTENDANCE CONFIRMED',
        details: `${result.target?.type}: ${result.target?.name} - Checked in successfully!`,
      });
    } else {
      playScanChime(false);
      setScanFeedback({
        status: 'error',
        message: 'SCAN WARNING / REJECTED',
        details: result.message,
      });
    }
    setScanInput('');
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessScan(scanInput);
  };

  // Camera Handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLiveCameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera stream error:', err);
          setCameraError('Camera access not supported or permission denied in this browser frame. Virtual testing mode is active.');
          setIsLiveCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isLiveCameraActive]);

  const columns: Column<QRAttendanceLog>[] = [
    {
      key: 'name',
      header: 'Scanned Individual',
      sortable: true,
      render: (log) => (
        <div>
          <p className="font-bold text-[#172554]">{log.name}</p>
          <p className="text-xs text-slate-400">{log.subInfo}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      sortable: true,
      render: (log) => (
        <Badge variant={log.type === 'Student' ? 'info' : 'purple'}>
          {log.type}
        </Badge>
      ),
    },
    {
      key: 'identifier',
      header: 'Digital ID Code',
      sortable: true,
      render: (log) => <span className="font-mono text-xs font-semibold text-slate-700">{log.identifier}</span>,
    },
    {
      key: 'timestamp',
      header: 'Exact Time',
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{log.timestamp}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Check-in Status',
      sortable: true,
      render: (log) => <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">QR Digital Attendance Kiosk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Contactless high-speed QR check-in for students and faculty</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => {
              const firstStudent = students[0];
              if (firstStudent) {
                setSelectedPersonForCard({
                  name: firstStudent.fullName,
                  id: firstStudent.studentId,
                  type: 'Student',
                  photo: firstStudent.photo,
                  roleOrClass: `${firstStudent.className} • Roll ${firstStudent.rollNumber}`,
                  phone: firstStudent.fatherPhone,
                });
              }
            }}
          >
            Generate Sample QR ID Card
          </Button>
        </div>
      </div>

      {/* Scanner & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Terminal Card */}
        <div className="lg:col-span-7">
          <Card
            title="Automated Optical Scanner"
            subtitle="Place QR pass or student card within optical viewfinder"
            icon={Scan}
          >
            <div className="space-y-4">
              {/* Virtual Scanner Viewport */}
              <div className="relative aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner border-2 border-slate-800">
                {isLiveCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-lg">
                      <QrCode className="w-16 h-16 text-blue-400" />
                      {/* Laser scanning bar animation */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
                    </div>
                    <p className="text-sm font-semibold text-white">Digital QR Scanner Active</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Ready to detect barcode lasers or instant manual card swipes.
                    </p>
                  </div>
                )}

                {/* Overlay corners */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br" />

                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => setIsLiveCameraActive((p) => !p)}
                    className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {isLiveCameraActive ? 'Stop Camera' : 'Live Camera'}
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Scan Feedback Banner */}
              <div
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                  scanFeedback.status === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : scanFeedback.status === 'error'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {scanFeedback.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                ) : scanFeedback.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Scan className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider">{scanFeedback.message}</h4>
                  {scanFeedback.details && (
                    <p className="text-sm font-semibold mt-0.5">{scanFeedback.details}</p>
                  )}
                </div>
              </div>

              {/* Fast Manual / Handheld Scanner Input Form */}
              <form onSubmit={handleSubmitManual} className="flex gap-2">
                <div className="relative flex-1">
                  <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan barcode or type ID (e.g., STD-2026-001 or STF-1001)..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    autoFocus
                  />
                </div>
                <Button variant="primary" type="submit">
                  Check-in
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Quick Testing & ID Cards Generator */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Instant Verification Simulation"
            subtitle="Click any registered member to simulate an optical scan"
            icon={Sparkles}
          >
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500">Quick Test Candidates:</p>

              <div className="space-y-2">
                {students.slice(0, 3).map((std) => (
                  <div
                    key={std.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={std.photo} alt={std.fullName} className="w-8 h-8 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172554] truncate">{std.fullName}</p>
                        <p className="text-[11px] font-mono text-blue-600 font-medium">{std.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedPersonForCard({
                            name: std.fullName,
                            id: std.studentId,
                            type: 'Student',
                            photo: std.photo,
                            roleOrClass: `${std.className} • Roll ${std.rollNumber}`,
                            phone: std.fatherPhone,
                          })
                        }
                        title="View printable QR ID Card"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleProcessScan(std.studentId)}>
                        Scan
                      </Button>
                    </div>
                  </div>
                ))}

                {staff.slice(0, 2).map((stf) => (
                  <div
                    key={stf.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50/50 hover:bg-purple-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={stf.photo} alt={stf.fullName} className="w-8 h-8 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172554] truncate">{stf.fullName}</p>
                        <p className="text-[11px] font-mono text-purple-600 font-medium">{stf.staffId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedPersonForCard({
                            name: stf.fullName,
                            id: stf.staffId,
                            type: 'Staff',
                            photo: stf.photo,
                            roleOrClass: `${stf.designation} (${stf.department})`,
                            phone: stf.phoneNumber,
                          })
                        }
                        title="View printable QR ID Card"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleProcessScan(stf.staffId)}>
                        Scan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* QR Log History Table */}
      <Card
        title="Live QR Attendance Activity Stream"
        subtitle="Real-time chronological scan entries with time stamps"
        icon={Scan}
      >
        <DataTable
          columns={columns}
          data={qrLogs}
          searchPlaceholder="Filter logs by name, roll, or ID code..."
          exportFileName="QR_Attendance_Logs"
        />
      </Card>

      {/* Printable ID Card & QR Pass Modal */}
      {selectedPersonForCard && (
        <Modal
          isOpen={Boolean(selectedPersonForCard)}
          onClose={() => setSelectedPersonForCard(null)}
          title="Official Institution Smart ID & QR Card"
          subtitle="Printable high-resolution digital pass for campus access"
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* ID Card Front Frame */}
            <div
              id="printable-id-card"
              className="w-full bg-gradient-to-b from-blue-700 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden print-page"
            >
              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <School className="w-48 h-48" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={schoolSettings.logo}
                      alt={schoolSettings.schoolName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-black tracking-wider uppercase text-white">{schoolSettings.schoolName}</h5>
                    <p className="text-[10px] text-blue-200">Official Access Smart Card • Estd: {schoolSettings.establishedYear}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-widest">
                  {selectedPersonForCard.type}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedPersonForCard.photo}
                  alt={selectedPersonForCard.name}
                  className="w-20 h-24 rounded-xl object-cover ring-2 ring-white/60 shadow-md shrink-0 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold tracking-tight truncate">{selectedPersonForCard.name}</h4>
                  <p className="text-xs text-blue-200 font-medium truncate mt-0.5">
                    {selectedPersonForCard.roleOrClass}
                  </p>
                  <p className="text-xs font-mono font-bold tracking-wider text-amber-300 mt-2">
                    ID: {selectedPersonForCard.id}
                  </p>
                  {selectedPersonForCard.phone && (
                    <p className="text-[10px] text-blue-200 mt-0.5">Tel: {selectedPersonForCard.phone}</p>
                  )}
                </div>
              </div>

              {/* QR Code Graphic Frame */}
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="bg-white p-2 rounded-xl shadow-md">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white relative p-1">
                    <QrCode className="w-14 h-14 text-white" />
                  </div>
                </div>
                <div className="text-right text-[10px] text-blue-200">
                  <p className="font-semibold text-white">Scan for Biometric Entry</p>
                  <p>Valid Academic Year 2026</p>
                  <p className="text-[9px] text-blue-300 mt-1">Authorized Principal Seal Verified</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setSelectedPersonForCard(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  printElement('printable-id-card', {
                    title: `QR-Smart-Card-${selectedPersonForCard.id}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  });
                }}
              >
                Print Smart Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
