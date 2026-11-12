import React from 'react';
import { FinancialTransaction } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useSchool } from '../../context/SchoolContext';
import { School, Printer, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { printElement } from '../../utils/printUtils';

interface ReceiptModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { schoolSettings, updateTransaction } = useSchool();
  if (!transaction) return null;

  const isPaid = transaction.status === 'Paid';
  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  return (
    <Modal
      isOpen={Boolean(transaction)}
      onClose={onClose}
      title={isPaid ? 'Money Receipt & Voucher' : 'Due Bill & Fee Voucher'}
      subtitle={`Receipt No: ${transaction.receiptNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Printable Money Receipt */}
        <div id="printable-money-receipt" className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-7 print-page relative overflow-hidden">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 ring-1 ring-slate-300 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={schoolSettings.logo}
                  alt={schoolSettings.schoolName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-[#172554] tracking-tight">
                  {schoolSettings.institutionName || schoolSettings.schoolName}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {schoolSettings.address}
                </p>
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                  Official Accounts & Bursar Section • Estd: {schoolSettings.establishedYear} • EIIN: {schoolSettings.eiin}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-900 block">{transaction.receiptNumber}</span>
              <span className="text-[10px] text-slate-400">Date: {transaction.date}</span>
            </div>
          </div>

          <div className="text-center my-3">
            <span
              className={`px-4 py-1 rounded-full text-white text-xs font-black uppercase tracking-widest ${
                isPaid ? 'bg-slate-900' : 'bg-rose-700 shadow-xs'
              }`}
            >
              {isPaid ? 'MONEY RECEIPT' : 'DUE FEE VOUCHER'} - {transaction.feeType.toUpperCase()}
            </span>
          </div>

          {/* Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">{isPaid ? 'Received With Thanks From:' : 'Payable / Billed By:'}</span>
              <span className="font-bold text-[#172554]">{transaction.partyName}</span>
            </div>
            {transaction.partyId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Student / Candidate ID:</span>
                <span className="font-mono font-bold text-blue-700">{transaction.partyId}</span>
              </div>
            )}
            {transaction.classInfo && (
              <div className="flex justify-between">
                <span className="text-slate-400">Class & Section:</span>
                <span className="font-semibold text-slate-800">{transaction.classInfo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Fee Purpose / Title:</span>
              <span className="font-semibold text-slate-800">{transaction.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Gateway / Method:</span>
              <span className="font-semibold text-slate-700">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Clearance Status:</span>
              {isPaid ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled / Paid
                </span>
              ) : (
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" /> Payment Due (Pending)
                </span>
              )}
            </div>
            {transaction.notes && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Notes:</span>
                <span className="text-slate-600 italic">{transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between mb-6 ${
              isPaid
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isPaid ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {isPaid ? 'Total Amount Received' : 'Total Amount Due'}
              </span>
              <span
                className={`text-2xl font-black ${
                  isPaid ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {fmtBDT(transaction.amount)}
              </span>
            </div>
            <div className="text-right">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-emerald-700 border border-emerald-300 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payment Cleared
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-rose-700 border border-rose-300 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Payment Due
                </span>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-600">{isPaid ? 'Depositor Signature' : 'Student / Depositor'}</p>
            </div>
            <div className="text-center">
              <div className="font-script text-base text-blue-900 italic font-bold">K. Hasan</div>
              <div className="w-32 border-b border-slate-800 mb-1" />
              <p className="font-bold text-[#172554]">Authorized Bursar / Accounts</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {!isPaid && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              onClick={() => {
                updateTransaction(transaction.id, { status: 'Paid' });
              }}
            >
              Mark as Paid
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => {
              printElement('printable-money-receipt', {
                title: `${isPaid ? 'Receipt' : 'Due-Voucher'}-${transaction.receiptNumber}`,
                pageSize: 'A4',
                orientation: 'portrait',
              });
            }}
          >
            {isPaid ? 'Print Receipt' : 'Print Due Voucher'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
