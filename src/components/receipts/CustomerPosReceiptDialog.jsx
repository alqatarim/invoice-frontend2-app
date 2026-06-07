"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Download, Print, QrCode2 } from "@mui/icons-material";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSnackbar } from "notistack";
import { ArabicFonts } from "@/lib/fonts/arabicFonts";
import { RiyalIcon } from "@/utils/currencyUtils";

const formatMoney = (value) => Number(value || 0).toFixed(2);

/** Pick receipt Arabic font — e.g. .cairo, .ibmPlexSansArabic, .notoKufiArabic */
const receiptArabicFont = ArabicFonts.notoKufiArabic;

const RECEIPT_ITEM_COLUMNS = [
  { key: "item", label: "Item", align: "left" },
  { key: "qty", label: "Qty", align: "center" },
  { key: "rate", label: "Rate", align: "center" },
  { key: "vat", label: "VAT", align: "center" },
  { key: "total", label: "Total", align: "center" },
];

const RECEIPT_ITEMS_GRID_TEMPLATE =
  "minmax(0, 1.7fr) minmax(18px, 0.32fr) minmax(30px, 0.48fr) minmax(26px, 0.42fr) minmax(34px, 0.52fr)";

/** Item grid column headers — Item, Qty, Rate, VAT, Total */
const receiptItemHeaderSx = {
  fontSize: "9px",
  color: "rgb(48, 48, 48)",
  // lineHeight: 1.35,
  fontWeight: 550,
};

/** Item name cells only */
const receiptItemNameCellSx = {
  fontSize: "7.5px",
  color: "rgb(48, 48, 48)",
  // lineHeight: 1.35,
  fontWeight: 450,
};

/** Qty, rate, VAT, and line total cells */
const receiptItemValueCellSx = {
  fontSize: "7.5px",
  color: "rgb(94, 94, 94)",
  // lineHeight: 1,
  fontWeight: 450,
};

/** Subtotal / VAT / Total labels */
const receiptSummaryLabelSx = {
  fontSize: "8.5px",
  color: "rgb(70, 70, 70)",
  // lineHeight: 1.35,
  fontWeight: 450,
};

/** Subtotal / VAT / Total amounts */
const receiptSummaryAmountSx = {
  fontSize: "8.5px",
  color: "rgb(74, 74, 74)",
  // lineHeight: 1,
  fontWeight: 450,
};

const ReceiptMoneyCell = ({ value, align = "center" }) => (
  <Stack direction="row" alignItems="baseline" spacing={0} justifyContent={align === "left" ? "flex-start" : "center"}>
    <Box component="span" sx={{ display: "inline-flex", lineHeight: 0, fontSize: "0.31rem" }}>
      <RiyalIcon width="1em" color="#2f2b3d" />
    </Box>
    <Typography component="span" sx={receiptItemValueCellSx}>
      {formatMoney(value)}
    </Typography>
  </Stack>
);

const toBase64 = (value) => {
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(value)));
};

const utf8ToBytes = (value) => {
  const encoded = unescape(encodeURIComponent(value));
  const bytes = [];

  for (let index = 0; index < encoded.length; index += 1) {
    bytes.push(encoded.charCodeAt(index));
  }

  return bytes;
};

const encodeTLV = (tag, value) => {
  const bytes = utf8ToBytes(String(value || ""));
  return [tag, bytes.length, ...bytes];
};

const buildZatcaPayload = ({ sellerName, vatNumber, timestamp, total, vatTotal }) => {
  const bytes = [
    ...encodeTLV(1, sellerName),
    ...encodeTLV(2, vatNumber),
    ...encodeTLV(3, timestamp),
    ...encodeTLV(4, total),
    ...encodeTLV(5, vatTotal),
  ];

  return toBase64(String.fromCharCode(...bytes));
};

const MoneyText = ({ value, strong = false }) => (
  <Stack direction="row" alignItems="baseline" spacing={0} justifyContent="flex-start">
    <Box component="span" sx={{ display: "inline-flex", lineHeight: 0, fontSize: "0.36rem" }}>
      <RiyalIcon width="1em" color="rgb(74, 74, 74)" />
    </Box>
    <Typography
      component="span"
      sx={{
        ...receiptSummaryAmountSx,
        ...(strong && { fontWeight: 700 }),
      }}
    >
      {formatMoney(value)}
    </Typography>
  </Stack>
);

export default function CustomerPosReceiptDialog({ open, loading = false, receiptData, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const company = receiptData?.company || receiptData?.store || {};
  const companyName = company?.companyName || company?.name || "Company";
  const vatNumber = company?.vat_number || company?.vatNo || company?.vat || company?.taxNumber || "N/A";
  const invoiceNumber = receiptData?.invoiceNumber || "N/A";
  const invoiceDate = receiptData?.invoiceDate ? dayjs(receiptData.invoiceDate) : dayjs();
  const customerName = receiptData?.customerId?.name || receiptData?.customer?.name || "Walk-in Customer";
  const subtotal = Number(receiptData?.taxableAmount || receiptData?.TotalWithoutVat || receiptData?.subTotal || 0);
  const vat = Number(receiptData?.vat || receiptData?.totalVat || receiptData?.totalTax || 0);
  const total = Number(receiptData?.TotalAmount || receiptData?.totalAmount || 0);
  const paidAmount = Number(receiptData?.paidAmount || total);

  const items = useMemo(
    () =>
      (receiptData?.items || []).map((item, index) => {
        const quantity = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const lineSubtotal = quantity * rate;
        const lineVat = Number(item.tax ?? item.lineTax ?? lineSubtotal * 0.15);
        const grandTotal = Number(item.amount ?? lineSubtotal + lineVat);

        return {
          key: item._id || item.productId || `${item.name || "item"}-${index}`,
          name: item.name || item.product?.name || item.productId?.name || "Item",
          quantity,
          rate,
          vat: lineVat,
          grandTotal,
        };
      }),
    [receiptData?.items]
  );

  const zatcaPayload = useMemo(
    () =>
      buildZatcaPayload({
        sellerName: companyName,
        vatNumber,
        timestamp: invoiceDate.toISOString(),
        total: formatMoney(total),
        vatTotal: formatMoney(vat),
      }),
    [companyName, invoiceDate, total, vat, vatNumber]
  );

  const handleDownload = async () => {
    const element = document.getElementById("customer-pos-receipt");
    if (!element) {
      enqueueSnackbar("Unable to find receipt content", { variant: "error" });
      return;
    }

    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [imgWidth, imgHeight] });

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt_${invoiceNumber}_${Date.now()}.pdf`);
      enqueueSnackbar("Receipt downloaded successfully", { variant: "success" });
    } catch (error) {
      console.error("Receipt download failed:", error);
      enqueueSnackbar("Failed to download receipt", { variant: "error" });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              id="customer-pos-receipt"
              sx={{
                width: 300,
                maxWidth: "100%",
                bgcolor: "#fff",
                color: "#2f2b3d",
                p: 3,
                borderRadius: 1,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Typography color='rgb(134, 134, 134)' sx={{ fontSize: 12, fontWeight: 500, textAlign: "center" }}>Tax Invoice Receipt</Typography>
              <Typography
                dir="rtl"
                sx={{
                  fontSize: 12,
                  color: "rgb(134, 134, 134)",
                  textAlign: "center",
                  mb: 1,
                  fontFamily: receiptArabicFont,
                  fontWeight: 500,
                }}
              >
                فاتورة ضريبية مبسطة
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 10.5, color: "rgb(134, 134, 134)", fontWeight: 450 }}>Invoice No:</Typography>
                <Typography sx={{ fontSize: 10.5, color: "rgb(134, 134, 134)", fontWeight: 550 }}>{invoiceNumber}</Typography>
              </Box>

              <Typography sx={{ pt: 2, fontSize: 12, fontWeight: 600, color: "rgb(70, 70, 70)", textAlign: "center" }}>{companyName}</Typography>
              <Typography sx={{ fontSize: 8, color: "rgb(159, 159, 159)", px: 5, textAlign: "center", mb: 1.5, fontFamily: receiptArabicFont }}>
                {company?.fullAddress || company?.address || company?.city || "Saudi Arabia"}
              </Typography>


              <Stack spacing={0.5}>

                <Box sx={{ display: "flex", justifyContent: "justify-start", gap: 2 }}>
                  <Typography sx={{ fontSize: 9, color: "rgb(70, 70, 70)", fontWeight: 450 }}>Date</Typography>
                  <Typography sx={{ fontSize: 9, color: "rgb(70, 70, 70)", fontWeight: 550 }}>{invoiceDate.format("YYYY/MM/DD HH:mm")}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "justify-start", gap: 2 }}>
                  <Typography sx={{ fontSize: 9, color: "rgb(70, 70, 70)", fontWeight: 450 }}>VAT:</Typography>
                  <Typography sx={{ fontSize: 9, color: "rgb(70, 70, 70)", fontWeight: 550 }}>{vatNumber}</Typography>
                </Box>

                {/* <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography sx={{ fontSize: 10, color: "rgb(70, 70, 70)", fontWeight: 450 }}>Customer</Typography>
                  <Typography sx={{ fontSize: 10, color: "rgb(70, 70, 70)", fontWeight: 550, fontFamily: receiptArabicFont }}>{customerName}</Typography>
                </Box> */}
              </Stack>

              <Divider sx={{ borderColor: 'rgb(203, 203, 203)', borderStyle: "dashed", my: 1 }} />

              <Box sx={{ overflowX: "auto" }}>
                {items.length ? (
                  <>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: RECEIPT_ITEMS_GRID_TEMPLATE,
                        gap: 2,
                        // pb: 0.5,
                        minWidth: 260,
                      }}
                    >
                      {RECEIPT_ITEM_COLUMNS.map((column) => (
                        <Typography
                          key={column.key}
                          sx={{
                            ...receiptItemHeaderSx,
                            textAlign: column.align,
                          }}
                        >
                          {column.label}
                        </Typography>
                      ))}
                    </Box>

                    <Divider sx={{ borderColor: 'rgb(203, 203, 203)', borderStyle: "dashed", my: 1 }} />

                    <Stack spacing={0.45} sx={{ minWidth: 260 }}>
                      {items.map((item) => (
                        <Box
                          key={item.key}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: RECEIPT_ITEMS_GRID_TEMPLATE,
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              ...receiptItemNameCellSx,
                              fontFamily: receiptArabicFont,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography sx={{ ...receiptItemValueCellSx, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <ReceiptMoneyCell value={item.rate} />
                          <ReceiptMoneyCell value={item.vat} />
                          <ReceiptMoneyCell value={item.grandTotal} />
                        </Box>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 10, color: "#6d6b77", textAlign: "center" }}>No items found</Typography>
                )}
              </Box>

              <Divider sx={{ borderColor: 'rgb(203, 203, 203)', borderStyle: "dashed", my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="column" spacing={0.2}>
                  <Typography sx={receiptSummaryLabelSx}>Subtotal</Typography>
                  <Typography sx={receiptSummaryLabelSx}>VAT</Typography>
                  <Typography sx={{ ...receiptSummaryLabelSx, fontWeight: 650 }}>Total</Typography>
                </Stack>

                <Stack direction="column" spacing={0.25} alignItems="space-between">
                  <MoneyText value={subtotal} />
                  <MoneyText value={vat} />
                  <MoneyText value={total} strong />
                </Stack>
              </Stack>





              {/* <Stack direction="column" justifyContent="space-between">
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={receiptSummaryLabelSx}>Subtotal</Typography>
                  <MoneyText value={subtotal} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={receiptSummaryLabelSx}>VAT</Typography>
                  <MoneyText value={vat} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ ...receiptSummaryLabelSx, fontWeight: 650 }}>Total</Typography>
                  <MoneyText value={total} strong />
                </Stack>
              </Stack> */}






              <Stack alignItems="center" spacing={0.75}>
                <QrCode2 sx={{ fontSize: 58, color: "#6d6b77" }} />
                <Typography sx={{ fontSize: 7.5, color: "#6d6b77", wordBreak: "break-all", textAlign: "center" }}>
                  {zatcaPayload}
                </Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgb(159, 159, 159)" }}>Thank you</Typography>
              </Stack>
            </Box>
          </Box>
        )
        }
      </DialogContent >
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="outlined" color="secondary" startIcon={<Print />} onClick={handlePrint} disabled={loading || !receiptData}>
          Print Receipt
        </Button>
        <Button variant="contained" startIcon={<Download />} onClick={handleDownload} disabled={loading || !receiptData}>
          Download
        </Button>
      </DialogActions>
    </Dialog >
  );
}
