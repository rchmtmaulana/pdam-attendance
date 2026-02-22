import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const generatePDFReport = async (userProfile, attendances, logbooks, stats) => {
    const doc = new jsPDF();

    if (!doc.autoTable && typeof autoTable === 'function') {
        doc.autoTable = autoTable.bind(doc);
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // ===== HEADER SECTION =====
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN ABSENSI MAGANG', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(14);
    doc.text('PDAM Makassar', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // ===== USER INFO =====
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const userInfo = [
        ['Nama', `: ${userProfile.name}`],
        ['NIM', `: ${userProfile.nim}`],
        ['Kampus', `: ${userProfile.kampus}`],
        ['Email', `: ${userProfile.email}`],
        ['Tanggal Cetak', `: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`],
    ];

    userInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 50, yPos);
        yPos += 7;
    });

    // ===== STATISTICS SUMMARY =====
    yPos += 5;
    doc.setFillColor(0, 102, 204);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN KEHADIRAN', 25, yPos);
    doc.setTextColor(0, 0, 0);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const statsData = [
        ['Durasi Magang', `: ${stats.durasiMagang ?? 0} hari kerja`],
        ['Total Hari Hadir', `: ${stats.totalHadir ?? 0} hari`],
        ['Persentase Kehadiran', `: ${stats.percentage ?? 0}%`],
    ];

    statsData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 85, yPos);
        yPos += 6;
    });

    // ===== ATTENDANCE TABLE =====
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RINCIAN ABSENSI', 20, yPos);

    yPos += 5;

    const attendanceTableData = attendances.map((att) => {
        const checkInTime = att.checkIn ? format(att.checkIn.time.toDate(), 'HH:mm') : '-';
        const checkInDist = att.checkIn ? `${att.checkIn.distance.toFixed(0)}m` : '-';
        const checkOutTime = att.checkOut ? format(att.checkOut.time.toDate(), 'HH:mm') : '-';
        const checkOutDist = att.checkOut ? `${att.checkOut.distance.toFixed(0)}m` : '-';
        const status = att.checkIn && att.checkOut ? 'Lengkap' : 'Belum Lengkap';

        return [
            format(new Date(att.date), 'dd/MM/yyyy'),
            checkInTime,
            checkInDist,
            checkOutTime,
            checkOutDist,
            status,
        ];
    });

    autoTable(doc, {
        startY: yPos,
        head: [['Tanggal', 'Masuk', 'Jarak', 'Pulang', 'Jarak', 'Status']],
        body: attendanceTableData,
        headStyles: {
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240],
        },
        margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // ===== LOGBOOK SECTION =====
    if (logbooks.length > 0) {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('LOGBOOK KEGIATAN HARIAN', 20, yPos);

        yPos += 10;

        logbooks.forEach((log, index) => {
            if (yPos > pageHeight - 100) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${format(new Date(log.date), 'EEEE, dd MMMM yyyy', { locale: id })}`, 20, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const descLines = doc.splitTextToSize(log.description, pageWidth - 50);
            doc.text(descLines, 25, yPos);
            yPos += descLines.length * 5;

            if (log.photoUrl && log.photoUrl.startsWith('data:image')) {
                yPos += 5;

                if (yPos > pageHeight - 80) {
                    doc.addPage();
                    yPos = 20;
                }

                try {
                    const imgWidth = 60;
                    const imgHeight = 45;
                    doc.addImage(log.photoUrl, 'JPEG', 25, yPos, imgWidth, imgHeight);
                    yPos += imgHeight + 10;
                } catch (error) {
                    console.error('Error adding image to PDF:', error);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text('(Foto tidak dapat dimuat)', 25, yPos);
                    yPos += 10;
                    doc.setTextColor(0, 0, 0);
                }
            }

            yPos += 5;

            if (index < logbooks.length - 1) {
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                doc.line(20, yPos, pageWidth - 20, yPos);
                yPos += 10;
            }
        });
    }

    // ===== FOOTER =====
    const totalPages = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `Laporan ini digenerate otomatis oleh Sistem Absensi Magang PDAM`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
    );

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
            `Halaman ${i} dari ${totalPages}`,
            pageWidth - 20,
            pageHeight - 10,
            { align: 'right' }
        );
    }

    // ===== SAVE PDF =====
    const fileName = `Laporan_Magang_${userProfile.name.replace(/\s/g, '_')}_${format(new Date(), 'ddMMyyyy')}.pdf`;
    doc.save(fileName);

    return fileName;
};
