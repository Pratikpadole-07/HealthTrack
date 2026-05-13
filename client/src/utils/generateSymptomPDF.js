import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSymptomPDF = (report) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Symptom Report", 14, 12);

  autoTable(doc, {
    startY: 20,
    head: [["Field", "Detail"]],
    body: [
      ["Condition", report.predictedCondition ?? "Unknown"],
      ["Severity", report.severity ?? "N/A"],
      ["Date", new Date(report.date).toLocaleString()],
      [
        "Symptoms",
        Array.isArray(report.symptoms)
          ? report.symptoms.join(", ")
          : report.symptoms
      ],
      [
        "Self-Care Tips",
        report.selfCareTips?.length
          ? report.selfCareTips.join(", ")
          : "None"
      ],
      [
        "Confidence",
        report.confidence
          ? Math.round(report.confidence * 100) + "%"
          : "N/A"
      ]
    ],
    theme: "striped",
  });

  doc.save(`Symptom_Report_${Date.now()}.pdf`);
};
