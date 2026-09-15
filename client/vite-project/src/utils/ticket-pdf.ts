import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export interface TicketPDFData {
  passengerName?: string;
  phone?: string;
  cnic?: string;
  email?: string;
  ticketId?: string;
  busName?: string;
  routeFrom?: string;
  routeTo?: string;
  date?: string;
  time?: string;
  seats?: string;
  amount?: string | number;
}

/**
 * Robust date formatter that avoids JavaScript UTC midnight timezone shift bugs.
 * Ensures that selecting "2026-09-16" displays as "16 September 2026" anywhere in the world.
 */
export const formatVoyageDate = (dateStr?: string): string => {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  // If already formatted like "16 September 2026" or "16 Sep"
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) {
    return dateStr;
  }

  // Handle YYYY-MM-DD or DD-MM-YYYY
  const cleanDateStr = dateStr.split('T')[0];
  const parts = cleanDateStr.split(/[-/]/);
  if (parts.length === 3) {
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);

    // If format is DD-MM-YYYY
    if (parts[0].length <= 2 && parts[2].length === 4) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Use midday local time to prevent UTC midnight rollover or DST edge cases
      const d = new Date(year, month - 1, day, 12, 0, 0);
      return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }

  return dateStr;
};

/**
 * Creates a high-definition vector PDF document using jsPDF directly.
 * Completely immune to Tailwind OKLCH color issues, CORS bugs, or canvas scaling artifacts.
 */
export const buildTicketPDFDocument = (data: TicketPDFData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const passenger = data.passengerName || "Valued Passenger";
  const phone = data.phone ? (data.phone.startsWith('+92') ? data.phone : `+92 ${data.phone}`) : "+92 300 0000000";
  const cnic = data.cnic || "35201-XXXXXXX-X";
  const ticketId = data.ticketId || `SL-${Date.now().toString().slice(-8)}`;
  const busName = data.busName || "SafarLink Executive Luxury";
  const routeFrom = data.routeFrom || "Lahore";
  const routeTo = data.routeTo || "Islamabad";
  const departureTime = data.time || "08:00 AM";
  const seats = data.seats || "Single Seat";
  const amountStr = typeof data.amount === 'number' ? `Rs. ${data.amount}` : (data.amount || "Rs. 1,600");
  const voyageDate = formatVoyageDate(data.date);
  const issuedDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

  // 1. Background Fill
  doc.setFillColor(252, 251, 249);
  doc.rect(0, 0, 210, 297, 'F');

  // 2. Luxury Outer Frame (Gold & Inner Accent)
  doc.setDrawColor(170, 132, 83);
  doc.setLineWidth(0.8);
  doc.roundedRect(12, 12, 186, 273, 3, 3, 'S');

  doc.setDrawColor(225, 215, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 14, 182, 269, 2, 2, 'S');

  // 3. Top Header Banner (Dark Velvet #1b1b1b)
  doc.setFillColor(27, 27, 27);
  doc.roundedRect(16, 16, 178, 44, 2, 2, 'F');

  // Gold Trim Line Under Header
  doc.setFillColor(170, 132, 83);
  doc.rect(16, 58, 178, 2, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('SAFARLINK', 24, 34);

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('VERIFIED DIGITAL MANIFEST & E-TICKET', 24, 43);

  // Issued Details (Right)
  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ISSUED ON', 184, 28, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(issuedDate, 184, 36, { align: 'right' });

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`TICKET ID: ${ticketId}`, 184, 46, { align: 'right' });

  // 4. Route & Fleet Section
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 226, 218);
  doc.setLineWidth(0.4);
  doc.roundedRect(16, 66, 178, 52, 2, 2, 'FD');

  // Fleet Tag
  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`FLEET SERVICE:  ${busName.toUpperCase()}`, 24, 76);

  doc.setDrawColor(240, 238, 234);
  doc.line(24, 80, 186, 80);

  // Departure City (Left)
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DEPARTURE STATION', 25, 90);

  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(routeFrom, 25, 100);

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Dep. Time: ${departureTime}`, 25, 108);

  // Middle Arrow Line
  doc.setDrawColor(170, 132, 83);
  doc.setLineWidth(0.8);
  doc.line(88, 96, 120, 96);
  doc.setFillColor(170, 132, 83);
  doc.triangle(118, 93, 124, 96, 118, 99, 'F');

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DIRECT TRANSIT', 104, 91, { align: 'center' });

  // Arrival City (Right)
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('FINAL DESTINATION', 140, 90);

  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(routeTo, 140, 100);

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Express Voyage', 140, 108);

  // 5. Four Grid Key Manifest Details
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, 124, 178, 56, 2, 2, 'FD');

  // Horizontal and Vertical Dividers
  doc.setDrawColor(240, 238, 234);
  doc.line(16, 152, 194, 152);
  doc.line(105, 124, 105, 180);

  // Cell 1: Passenger Name
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PASSENGER NAME', 25, 134);
  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(passenger, 25, 144);

  // Cell 2: Allocated Seats
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ALLOCATED SEAT(S)', 115, 134);
  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(seats, 115, 144);

  // Cell 3: Voyage Date
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('VOYAGE DATE', 25, 162);
  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(voyageDate, 25, 172);

  // Cell 4: Transit Class
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TRANSIT CLASS', 115, 162);
  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Executive Luxury Class', 115, 172);

  // 6. Contact & Settlement Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, 186, 178, 42, 2, 2, 'FD');

  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PASSENGER CONTACT & CNIC', 25, 196);

  doc.setTextColor(27, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(phone, 25, 206);

  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`CNIC: ${cnic}`, 25, 216);

  // Total Paid Amount (Right)
  doc.setTextColor(140, 130, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOTAL FARE PAID', 184, 196, { align: 'right' });

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(amountStr, 184, 207, { align: 'right' });

  doc.setTextColor(22, 163, 74); // Green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PAID & AUTHENTICATED', 184, 216, { align: 'right' });

  // 7. Travel Terms & Security Notice
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(16, 234, 178, 38, 2, 2, 'F');

  doc.setFillColor(170, 132, 83);
  doc.rect(16, 234, 3, 38, 'F');

  doc.setTextColor(170, 132, 83);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('IMPORTANT VOYAGE & BOARDING INSTRUCTIONS:', 24, 242);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('1. Please arrive at your departure lounge 15 minutes prior to scheduled departure.', 24, 248);
  doc.text('2. Present this official PDF digital ticket or printed manifest at the boarding gate.', 24, 254);
  doc.text('3. Valid Government Issued Photo ID (CNIC / Passport) is mandatory for seat verification.', 24, 260);
  doc.text('4. For concierge service and 24/7 inquiries, reach out to concierge@safarlink.com', 24, 266);

  // 8. Bottom Footer
  doc.setTextColor(170, 160, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('SAFARLINK LUXURY BUS TRANSIT • OFFICIAL PASSENGER MANIFEST & RECEIPT', 105, 280, { align: 'center' });

  return doc;
};

/**
 * Downloads the ticket PDF file directly to user's device
 */
export const downloadTicketPDF = (data: TicketPDFData): boolean => {
  const toastId = toast.loading("Generating high-definition ticket PDF...");
  try {
    const doc = buildTicketPDFDocument(data);
    const fileName = `SafarLink-Ticket-${data.ticketId || data.passengerName?.replace(/\s+/g, '_') || 'manifest'}.pdf`;
    doc.save(fileName);
    toast.success("Ticket PDF downloaded successfully!", { id: toastId });
    return true;
  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    toast.error("Failed to generate PDF ticket", { id: toastId });
    return false;
  }
};

/**
 * Shares the ticket PDF via Web Share API or download + WhatsApp fallback
 */
export const shareTicketPDF = async (data: TicketPDFData): Promise<void> => {
  const toastId = toast.loading("Preparing ticket PDF for sharing...");
  try {
    const doc = buildTicketPDFDocument(data);
    const fileName = `SafarLink-Ticket-${data.ticketId || data.passengerName?.replace(/\s+/g, '_') || 'manifest'}.pdf`;
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    const passenger = data.passengerName || "Valued Passenger";
    const route = data.routeFrom && data.routeTo ? `${data.routeFrom} ➔ ${data.routeTo}` : "Pakistan Transit";
    const bus = data.busName || "SafarLink Executive";
    const date = formatVoyageDate(data.date);
    const seats = data.seats || "Reserved";

    // 1. If Web Share API with file support is available (Mobile devices, Android, iOS Safari, etc.)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        toast.dismiss(toastId);
        await navigator.share({
          title: `SafarLink E-Ticket - ${passenger}`,
          text: `Official SafarLink Travel Ticket for ${passenger} (${route} on ${date})`,
          files: [file]
        });
        return;
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          return; // User dismissed or cancelled the native share sheet
        }
        console.warn("navigator.share failed, seamlessly falling back to download + WhatsApp:", shareErr);
      }
    }

    // 2. Desktop browser fallback:
    // Download the PDF file directly to device
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    toast.success("Ticket PDF downloaded! Opening WhatsApp to attach and send.", { id: toastId, duration: 4000 });

    const waText = `*SAFARLINK LUXURY TRAVEL - E-TICKET*\n\n` +
      `👤 *Passenger:* ${passenger}\n` +
      `🚌 *Fleet:* ${bus}\n` +
      `📍 *Route:* ${route}\n` +
      `📅 *Date:* ${date}\n` +
      `💺 *Seat(s):* ${seats}\n` +
      `✅ *Status:* Confirmed & Paid\n\n` +
      `📄 _(The official PDF ticket has been downloaded to attach in this chat.)_`;

    setTimeout(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
    }, 400);

  } catch (error: any) {
    if (error?.name === 'AbortError') {
      toast.dismiss(toastId);
      return; // User cancelled share modal
    }
    console.error("Error sharing ticket PDF:", error);
    toast.error("Failed to share PDF ticket", { id: toastId });
  }
};
