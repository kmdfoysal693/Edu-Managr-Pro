import { ActiveSubscription, SubscriptionOrder, SubscriptionPlan } from '../types';

export interface SubscriptionPdfPayload {
  schoolName: string;
  institutionName: string;
  address: string;
  phone: string;
  email: string;
  plan: SubscriptionPlan;
  activeSubscription: ActiveSubscription;
  order?: SubscriptionOrder | null;
  totalPurchases: number;
}

const formatPdfDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'Lifetime (No Expiry)';
  try {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(isoString);
  }
};

const formatBdt = (amount: number): string =>
  amount === 0 ? 'BDT 0.00' : `BDT ${amount.toLocaleString('en-US')}`;

export async function downloadSubscriptionPdf(
  payload: SubscriptionPdfPayload
): Promise<string> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const {
    schoolName,
    institutionName,
    address,
    phone,
    email,
    plan,
    activeSubscription,
    order,
    totalPurchases,
  } = payload;

  const docRef =
    order?.invoiceNumber ||
    activeSubscription.transactionId ||
    `PLAN-${plan.tierIndex}`;
  const issuedDate = formatPdfDate(
    order?.paidAt || activeSubscription.startedAt
  );
  const expiresDate = order
    ? plan.durationDays !== null
      ? formatPdfDate(
          new Date(
            new Date(order.paidAt).getTime() +
              plan.durationDays * 24 * 60 * 60 * 1000
          ).toISOString()
        )
      : 'Lifetime (No Expiry)'
    : formatPdfDate(activeSubscription.expiresAt);

  const subscriberName =
    order?.payerName ||
    activeSubscription.subscriberName ||
    institutionName ||
    schoolName;
  const subscriberPhone =
    order?.payerPhone ||
    order?.accountNumber ||
    activeSubscription.subscriberPhone ||
    phone ||
    'N/A';
  const paymentMethod =
    order?.paymentMethod || activeSubscription.paymentMethod || 'Free Trial';
  const transactionId =
    order?.transactionId || activeSubscription.transactionId || 'AUTO-ACTIVE';
  const amountPaid = order ? order.amount : activeSubscription.amountPaid;
  const planName = order?.planName || plan.name;
  const durationLabel = order?.durationLabel || plan.durationLabel;
  const statusLabel = order?.status || activeSubscription.status;

  // Header Banner
  doc.setFillColor(23, 37, 84); // #172554
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(schoolName || 'EduManage Institution', 16, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(institutionName || schoolName, 16, 22.5);
  doc.text(`${address || ''}  |  ${phone || ''}  |  ${email || ''}`, 16, 28.5, {
    maxWidth: 118,
  });

  // Right Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MY PLAN & RECEIPT', 194, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(191, 219, 254);
  doc.text(`Ref: ${docRef}`, 194, 22.5, { align: 'right' });
  doc.text(`Date: ${issuedDate}`, 194, 28.5, { align: 'right' });

  // Purchased Plan Summary Box
  let y = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 178, 30, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('PURCHASED SUBSCRIPTION PLAN', 22, y + 8);
  doc.text('AMOUNT PAID', 190, y + 8, { align: 'right' });

  doc.setTextColor(23, 37, 84);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`${plan.tierIndex}. ${planName}`, 22, y + 16);
  doc.text(formatBdt(amountPaid), 190, y + 16, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Cycle: ${durationLabel}   |   Status: ${statusLabel}   |   Total Purchases Recorded: ${totalPurchases}`,
    22,
    y + 24
  );

  // Two-column Subscriber & Payment Details
  y = 88;
  doc.setTextColor(23, 37, 84);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Subscriber Details', 16, y);
  doc.text('Payment & Activation Details', 110, y);

  doc.setDrawColor(226, 232, 240);
  doc.line(16, y + 2.5, 98, y + 2.5);
  doc.line(110, y + 2.5, 194, y + 2.5);

  const leftRows: Array<[string, string]> = [
    ['Subscriber Name', subscriberName],
    ['Contact Number', subscriberPhone],
    ['Institution', institutionName || schoolName],
    ['Activated On', issuedDate],
    ['Valid Until', expiresDate],
  ];

  const rightRows: Array<[string, string]> = [
    ['Payment Method', paymentMethod],
    ...(order?.bankName ? [['Bank Name', order.bankName] as [string, string]] : []),
    ['Account / Phone', order?.accountNumber || subscriberPhone],
    ['Transaction / Ref ID', transactionId],
    ['Reference Invoice', docRef],
    ['Record Status', statusLabel],
  ];

  doc.setFontSize(9);
  let rowY = y + 9;
  leftRows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${k}:`, 16, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v), 48, rowY, { maxWidth: 50 });
    rowY += 7;
  });

  rowY = y + 9;
  rightRows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${k}:`, 110, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v), 146, rowY, { maxWidth: 48 });
    rowY += 7;
  });

  // Plan Entitlements Table
  y = 142;
  doc.setTextColor(23, 37, 84);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Included Module Quotas & Entitlements', 16, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(16, y, 178, 9, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(16, y, 178, 9, 'S');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Module / Feature Scope', 20, y + 6);
  doc.text('Allowed Capacity / Quota', 190, y + 6, { align: 'right' });

  y += 9;
  plan.highlights.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(16, y, 178, 9, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(16, y, 178, 9, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(item.label, 20, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 37, 84);
    doc.text(item.value, 190, y + 6, { align: 'right' });
    y += 9;
  });

  // Verification Footer
  y += 14;
  doc.setDrawColor(203, 213, 225);
  doc.line(16, y, 80, y);
  doc.line(130, y, 194, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subscriber / Authorized Signature', 16, y + 5);
  doc.text('Institutional System Verification', 194, y + 5, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-GB')}  |  EduManage Subscription License Registry`,
    105,
    284,
    { align: 'center' }
  );

  const safeSlug = docRef.replace(/[^a-zA-Z0-9_-]/g, '-');
  const filename = `My-Plan-${safeSlug}.pdf`;
  doc.save(filename);
  return filename;
}
