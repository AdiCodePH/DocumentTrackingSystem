const storageKey = "clo-file-registry";
const legacyStorageKey = "clo-documents";

const seedFiles = [
  {
    id: "CLO-2026-0142",
    title: "Legal Opinion Request from Mayor's Office",
    origin: "City Administrator",
    requestedBy: "Mayor's Office",
    dateReceived: "2026-06-01",
    status: "received",
    destination: "",
    outgoingDate: "",
    remarks: "",
    timeline: [
      ["Received", "City Legal Office", "June 1, 2026 - 8:14 AM"],
      ["Barcode Generated", "Registry Desk", "June 1, 2026 - 8:30 AM"]
    ]
  },
  {
    id: "CLO-2026-0139",
    title: "Notice of Hearing Response",
    origin: "City Legal Office",
    requestedBy: "Regional Trial Court",
    dateReceived: "2026-05-31",
    status: "outgoing",
    destination: "Regional Trial Court",
    outgoingDate: "2026-06-01",
    remarks: "Released to court receiving desk.",
    timeline: [
      ["Barcode Generated", "Registry Desk", "May 31, 2026 - 4:18 PM"],
      ["Marked Outgoing", "Regional Trial Court", "June 1, 2026 - 10:45 AM"]
    ]
  },
  {
    id: "CLO-2026-0136",
    title: "Barangay Mediation Opinion Request",
    origin: "Barangay Gredu",
    requestedBy: "Barangay Secretary",
    dateReceived: "2026-05-30",
    status: "received",
    destination: "",
    outgoingDate: "",
    remarks: "",
    timeline: [
      ["Received", "City Legal Office", "May 30, 2026 - 2:05 PM"],
      ["Barcode Generated", "Registry Desk", "May 30, 2026 - 2:10 PM"]
    ]
  }
];

let files = normalizeFiles(loadFiles());
let activePage = "dashboard";
let selectedId = files[0]?.id || "";

const rowsElement = document.getElementById("receivedRows");
const dashboardRowsElement = document.getElementById("dashboardRows");
const dashboardOutgoingList = document.getElementById("dashboardOutgoingList");
const outgoingList = document.getElementById("outgoingList");
const searchInput = document.getElementById("searchInput");
const systemMessage = document.getElementById("systemMessage");
const navLinks = document.querySelectorAll("[data-nav-page]");
const pageViews = document.querySelectorAll("[data-page]");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");
const menuButton = document.getElementById("menuButton");
const addDocumentButton = document.getElementById("addDocumentButton");
const documentModal = document.getElementById("documentModal");
const closeModalButton = document.getElementById("closeModalButton");
const documentForm = document.getElementById("documentForm");
const outgoingForm = document.getElementById("outgoingForm");
const lookupCard = document.getElementById("lookupCard");
const barcodeModal = document.getElementById("barcodeModal");
const closeBarcodeButton = document.getElementById("closeBarcodeButton");
const closeBarcodeSecondaryButton = document.getElementById("closeBarcodeSecondaryButton");
const printBarcodeButton = document.getElementById("printBarcodeButton");
const printSelectedBarcodeButton = document.getElementById("printSelectedBarcodeButton");
const releaseFileButton = document.getElementById("releaseFileButton");
const startBarcodeScannerButton = document.getElementById("startBarcodeScannerButton");
const stopBarcodeScannerButton = document.getElementById("stopBarcodeScannerButton");
const cameraScanner = document.getElementById("cameraScanner");
const barcodeScannerVideo = document.getElementById("barcodeScannerVideo");
const barcodeScannerStatus = document.getElementById("barcodeScannerStatus");
const selectedBarcodePreview = document.getElementById("selectedBarcodePreview");
const barcodeLarge = document.getElementById("barcodeLarge");
const barcodeDocumentTitle = document.getElementById("barcodeDocumentTitle");
const barcodeTrackingNumber = document.getElementById("barcodeTrackingNumber");
const barcodeDocumentMeta = document.getElementById("barcodeDocumentMeta");

const code39Patterns = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  "A": "wnnnnwnnw",
  "B": "nnwnnwnnw",
  "C": "wnwnnwnnn",
  "D": "nnnnwwnnw",
  "E": "wnnnwwnnn",
  "F": "nnwnwwnnn",
  "G": "nnnnnwwnw",
  "H": "wnnnnwwnn",
  "I": "nnwnnwwnn",
  "J": "nnnnwwwnn",
  "K": "wnnnnnnww",
  "L": "nnwnnnnww",
  "M": "wnwnnnnwn",
  "N": "nnnnwnnww",
  "O": "wnnnwnnwn",
  "P": "nnwnwnnwn",
  "Q": "nnnnnnwww",
  "R": "wnnnnnwwn",
  "S": "nnwnnnwwn",
  "T": "nnnnwnwwn",
  "U": "wwnnnnnnw",
  "V": "nwwnnnnnw",
  "W": "wwwnnnnnn",
  "X": "nwnnwnnnw",
  "Y": "wwnnwnnnn",
  "Z": "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "$": "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn",
  "*": "nwnnwnwnn"
};

let scannerStream = null;
let scannerDetector = null;
let scannerFrameId = 0;

function loadFiles() {
  const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
  if (!saved) {
    return seedFiles;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return seedFiles;
  }
}

function normalizeFiles(items) {
  return items.map((item) => {
    const status = item.status === "pending-approval" || item.status === "outgoing" || item.status === "released" ? item.status : item.status === "routed" || item.status === "completed" ? "outgoing" : "received";
    return {
      id: item.id,
      title: item.title || "Untitled file",
      origin: item.origin || "Unknown office",
      requestedBy: item.requestedBy || "",
      dateReceived: item.dateReceived || item.dueDate || new Date().toISOString().slice(0, 10),
      status,
      destination: item.destination || (status !== "received" ? item.assignee || "" : ""),
      outgoingDate: item.outgoingDate || (status === "outgoing" || status === "released" ? item.dueDate || new Date().toISOString().slice(0, 10) : ""),
      remarks: item.remarks || "",
      timeline: item.timeline?.length ? item.timeline : [["Received", "City Legal Office", formatTimestamp(new Date())]]
    };
  });
}

function saveFiles() {
  localStorage.setItem(storageKey, JSON.stringify(files));
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "The server could not complete the request.");
  }

  return response.json();
}

async function refreshFiles() {
  try {
    files = normalizeFiles(await apiRequest("api/files"));
    selectedId = files.some((file) => file.id === selectedId) ? selectedId : files[0]?.id || "";
    saveFiles();
    render();
    renderLookupCard(outgoingForm.elements.trackingNo.value);
  } catch (error) {
    showMessage(error.message, true);
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatTimestamp(dateValue) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(dateValue);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nextTrackingNumber() {
  const highest = files.reduce((max, file) => {
    const match = file.id.match(/CLO-2026-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `CLO-2026-${String(highest + 1).padStart(4, "0")}`;
}

function getSelectedFile() {
  return files.find((file) => file.id === selectedId) || files[0];
}

function statusClass(file) {
  return `status-${file.status}`;
}

function statusLabel(file) {
  if (file.status === "pending-approval") {
    return "for Approval";
  }

  if (file.status === "outgoing") {
    return "authorized";
  }

  if (file.status === "released") {
    return "released";
  }

  return file.status;
}

function getOutgoingFiles() {
  const query = searchInput.value.trim().toLowerCase();
  return files.filter((file) => {
    const statusMatches = file.status === "pending-approval" || file.status === "outgoing" || file.status === "released";
    const queryMatches = [file.id, file.title, file.origin, file.requestedBy, file.destination]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return statusMatches && queryMatches;
  });
}

function generateBarcodeSvg(value) {
  const text = `*${String(value).toUpperCase()}*`;
  const narrow = 2;
  const wide = 5;
  const gap = narrow;
  const height = 78;
  const quiet = 14;
  let x = quiet;
  let bars = "";

  for (const character of text) {
    const pattern = code39Patterns[character];
    if (!pattern) {
      continue;
    }

    [...pattern].forEach((widthKey, index) => {
      const width = widthKey === "w" ? wide : narrow;
      if (index % 2 === 0) {
        bars += `<rect x="${x}" y="0" width="${width}" height="${height}" />`;
      }
      x += width;
    });

    x += gap;
  }

  const width = x + quiet;
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Barcode ${escapeHtml(value)}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#fff" />
      <g fill="#111">${bars}</g>
    </svg>
  `;
}

function showMessage(message, isError = false) {
  systemMessage.textContent = message;
  systemMessage.classList.toggle("error", isError);
  systemMessage.classList.add("show");

  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    systemMessage.classList.remove("show", "error");
    systemMessage.textContent = "";
  }, 3600);
}

function setScannerStatus(message, isError = false) {
  barcodeScannerStatus.textContent = message;
  barcodeScannerStatus.classList.toggle("error", isError);
}

function cleanScannedCode(value) {
  return String(value || "")
    .trim()
    .replace(/^\*/, "")
    .replace(/\*$/, "");
}

async function startBarcodeScanner() {
  if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
    showMessage("Camera scanning is not supported in this browser.", true);
    return;
  }

  if (!("BarcodeDetector" in window)) {
    showMessage("This browser does not support barcode scanning. Please type the tracking number manually.", true);
    return;
  }

  try {
    scannerDetector = new BarcodeDetector({
      formats: ["code_39", "code_128", "qr_code"]
    });
  } catch {
    scannerDetector = new BarcodeDetector();
  }

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });
    barcodeScannerVideo.srcObject = scannerStream;
    cameraScanner.hidden = false;
    startBarcodeScannerButton.disabled = true;
    setScannerStatus("Point the camera at the barcode.");
    await barcodeScannerVideo.play();
    scanBarcodeFrame();
  } catch {
    showMessage("Camera permission was denied or no camera was found.", true);
    stopBarcodeScanner();
  }
}

async function scanBarcodeFrame() {
  if (!scannerDetector || !scannerStream) {
    return;
  }

  try {
    const barcodes = await scannerDetector.detect(barcodeScannerVideo);
    if (barcodes.length) {
      const trackingNo = cleanScannedCode(barcodes[0].rawValue);
      outgoingForm.elements.trackingNo.value = trackingNo;
      renderLookupCard(trackingNo);
      setScannerStatus(`Scanned ${trackingNo}`);
      showMessage(`Scanned tracking number: ${trackingNo}`);
      stopBarcodeScanner();
      return;
    }
  } catch {
    setScannerStatus("Scanning paused. Keep the barcode inside the frame.", true);
  }

  scannerFrameId = window.requestAnimationFrame(scanBarcodeFrame);
}

function stopBarcodeScanner() {
  if (scannerFrameId) {
    window.cancelAnimationFrame(scannerFrameId);
    scannerFrameId = 0;
  }

  if (scannerStream) {
    scannerStream.getTracks().forEach((track) => track.stop());
    scannerStream = null;
  }

  barcodeScannerVideo.srcObject = null;
  cameraScanner.hidden = true;
  startBarcodeScannerButton.disabled = false;
  scannerDetector = null;
}

function showPage(pageName) {
  if (pageName !== "mark-outgoing") {
    stopBarcodeScanner();
  }

  activePage = pageName;
  pageViews.forEach((page) => page.classList.toggle("active", page.dataset.page === activePage));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.navPage === activePage));
  toggleSidebar(false);
  window.location.hash = pageName === "dashboard" ? "" : pageName;
}

function toggleSidebar(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", shouldOpen);
  backdrop.classList.toggle("show", shouldOpen);
}

function getFilteredFiles(status = "all") {
  const query = searchInput.value.trim().toLowerCase();
  return files.filter((file) => {
    const statusMatches = status === "all" || file.status === status;
    const queryMatches = [file.id, file.title, file.origin, file.requestedBy, file.destination]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return statusMatches && queryMatches;
  });
}

function renderMetrics() {
  document.getElementById("totalCount").textContent = files.length;
  document.getElementById("receivedCount").textContent = files.filter((file) => file.status === "received").length;
  document.getElementById("outgoingCount").textContent = files.filter((file) => file.status === "outgoing" || file.status === "released").length;
  document.getElementById("pendingApprovalCount").textContent = files.filter((file) => file.status === "pending-approval").length;
}

function renderDashboard() {
  dashboardRowsElement.innerHTML = files.slice(0, 5).map((file) => `
    <button class="compact-item" type="button" data-id="${escapeHtml(file.id)}">
      <div>
        <strong>${escapeHtml(file.title)}</strong>
        <p>${escapeHtml(file.id)} - ${escapeHtml(file.origin)}</p>
      </div>
      <span class="status-pill ${statusClass(file)}">${statusLabel(file)}</span>
    </button>
  `).join("");

  const outgoing = files.filter((file) => file.status === "pending-approval" || file.status === "outgoing" || file.status === "released").slice(0, 5);
  dashboardOutgoingList.innerHTML = outgoing.length ? outgoing.map((file) => `
    <div class="priority-item">
      <div>
        <strong>${escapeHtml(file.title)}</strong>
        <p>${escapeHtml(file.id)} - ${escapeHtml(file.destination || "No destination")}</p>
      </div>
      <span class="status-pill ${statusClass(file)}">${statusLabel(file)}</span>
    </div>
  `).join("") : `<div class="empty-state">No outgoing files yet.</div>`;
}

function renderReceivedRows() {
  const received = getFilteredFiles("received");
  rowsElement.innerHTML = received.length ? received.map((file) => `
    <tr data-id="${escapeHtml(file.id)}" class="${file.id === selectedId ? "selected" : ""}">
      <td>${escapeHtml(file.id)}</td>
      <td>
        <span class="doc-title">${escapeHtml(file.title)}</span>
        <span class="doc-type">${escapeHtml(file.remarks || "Received file")}</span>
      </td>
      <td>${escapeHtml(file.origin)}</td>
      <td>${escapeHtml(file.requestedBy || "-")}</td>
      <td>${formatDate(file.dateReceived)}</td>
      <td><span class="status-pill ${statusClass(file)}">${statusLabel(file)}</span></td>
    </tr>
  `).join("") : `
    <tr>
      <td colspan="6">No received files match the current search.</td>
    </tr>
  `;
}

function renderOutgoingList() {
  const outgoing = getOutgoingFiles();
  outgoingList.innerHTML = outgoing.length ? outgoing.map((file) => `
    <button class="route-item" type="button" data-id="${escapeHtml(file.id)}">
      <div>
        <strong>${escapeHtml(file.title)}</strong>
        <p>${escapeHtml(file.id)} - ${escapeHtml(file.destination || "No destination")}</p>
      </div>
      <span class="status-pill ${statusClass(file)}">${statusLabel(file)}</span>
    </button>
  `).join("") : `<div class="empty-state">No outgoing files match the current search.</div>`;
}

function renderDetails() {
  const file = getSelectedFile();
  if (!file) {
    document.getElementById("selectedTitle").textContent = "No files";
    document.getElementById("selectedStatus").textContent = "-";
    document.getElementById("selectedTracking").textContent = "-";
    document.getElementById("selectedDestination").textContent = "-";
    document.getElementById("timelineList").innerHTML = "";
    selectedBarcodePreview.innerHTML = "";
    releaseFileButton.hidden = true;
    return;
  }

  selectedId = file.id;
  document.getElementById("selectedTitle").textContent = file.title;
  document.getElementById("selectedStatus").textContent = statusLabel(file);
  document.getElementById("selectedTracking").textContent = file.id;
  document.getElementById("selectedDestination").textContent = file.destination || file.requestedBy || "-";
  selectedBarcodePreview.innerHTML = generateBarcodeSvg(file.id);
  releaseFileButton.hidden = file.status !== "outgoing";
  document.getElementById("timelineList").innerHTML = file.timeline.map((item) => `
    <div class="timeline-item">
      <strong>${escapeHtml(item[0])} - ${escapeHtml(item[1])}</strong>
      <span>${escapeHtml(item[2])}</span>
    </div>
  `).join("");
}

function renderLookupCard(trackingNo = "") {
  const file = files.find((item) => item.id.toUpperCase() === trackingNo.trim().toUpperCase());
  lookupCard.innerHTML = file ? `
    <span class="detail-label">Tracking number</span>
    <strong>${escapeHtml(file.id)}</strong>
    <span class="detail-label">File title</span>
    <strong>${escapeHtml(file.title)}</strong>
    <span class="detail-label">Current status</span>
    <strong>${escapeHtml(statusLabel(file))}</strong>
  ` : `
    <span class="detail-label">Tracking number</span>
    <strong>${escapeHtml(trackingNo || "-")}</strong>
    <span class="detail-label">File title</span>
    <strong>-</strong>
    <span class="detail-label">Current status</span>
    <strong>-</strong>
  `;
}

function renderReportStack() {
  const receivedCount = files.filter((file) => file.status === "received").length;
  const outgoingCount = files.filter((file) => file.status === "outgoing" || file.status === "released").length;
  const rows = [
    ["Received", receivedCount],
    ["Outgoing", outgoingCount],
    ["Barcode labels", files.length]
  ];

  document.getElementById("reportStack").innerHTML = rows.map(([label, count]) => {
    const percent = files.length ? Math.round((count / files.length) * 100) : 0;
    return `
      <div class="report-item">
        <div>
          <strong>${label}</strong>
          <p>${count} file${count === 1 ? "" : "s"} - ${percent}%</p>
        </div>
        <div class="report-meter" aria-label="${label} ${percent}%">
          <span style="--meter: ${percent}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function render() {
  renderMetrics();
  renderDashboard();
  renderReceivedRows();
  renderOutgoingList();
  renderDetails();
  renderReportStack();
}

function openBarcodeDialog(file) {
  barcodeDocumentTitle.textContent = file.title;
  barcodeTrackingNumber.textContent = file.id;
  barcodeDocumentMeta.textContent = `${file.origin}${file.requestedBy ? ` - Requested by ${file.requestedBy}` : ""}`;
  barcodeLarge.innerHTML = generateBarcodeSvg(file.id);
  barcodeModal.showModal();
}

async function releaseSelectedFile() {
  const file = getSelectedFile();
  if (!file) {
    showMessage("Select a file before releasing.", true);
    return;
  }

  if (file.status === "pending-approval") {
    showMessage(`${file.id} still needs Super Admin approval before release.`, true);
    return;
  }

  if (file.status === "released") {
    showMessage(`${file.id} is already released.`, true);
    return;
  }

  if (file.status !== "outgoing") {
    showMessage(`${file.id} is not authorized for release yet.`, true);
    return;
  }

  try {
    const updatedFile = normalizeFiles([await apiRequest(`api/files/${encodeURIComponent(file.id)}/release`, {
      method: "PATCH"
    })])[0];

    files = files.map((item) => item.id === updatedFile.id ? updatedFile : item);
    selectedId = updatedFile.id;
    saveFiles();
    render();
    showMessage(`Released: ${updatedFile.id} - ${updatedFile.title}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function requestFileOutgoing(trackingNo, destination, requestedBy, remarks) {
  const file = files.find((item) => item.id.toUpperCase() === trackingNo.trim().toUpperCase());
  if (!file) {
    showMessage(`No file found for tracking number ${trackingNo}.`, true);
    renderLookupCard(trackingNo);
    return;
  }

  if (file.status === "pending-approval") {
    showMessage(`${file.id} is already marked outgoing and waiting for Super Admin approval.`, true);
    renderLookupCard(file.id);
    return;
  }

  if (file.status === "outgoing") {
    showMessage(`${file.id} is already authorized for release.`, true);
    renderLookupCard(file.id);
    return;
  }

  if (file.status === "released") {
    showMessage(`${file.id} has already been released.`, true);
    renderLookupCard(file.id);
    return;
  }

  try {
    const updatedFile = normalizeFiles([await apiRequest(`api/files/${encodeURIComponent(file.id)}/request-release`, {
      method: "PATCH",
      body: JSON.stringify({
        destination: destination.trim(),
        requestedBy: requestedBy.trim(),
        remarks: remarks.trim()
      })
    })])[0];

    files = files.map((item) => item.id === updatedFile.id ? updatedFile : item);
    selectedId = updatedFile.id;
    saveFiles();
    render();
    renderLookupCard(updatedFile.id);
    showMessage(`Submitted for Super Admin approval: ${updatedFile.id} - ${updatedFile.title}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

rowsElement.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) {
    return;
  }

  selectedId = row.dataset.id;
  showPage("outgoing");
  render();
});

dashboardRowsElement.addEventListener("click", (event) => {
  const item = event.target.closest("[data-id]");
  if (!item) {
    return;
  }

  selectedId = item.dataset.id;
  showPage("outgoing");
  render();
});

outgoingList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-id]");
  if (!item) {
    return;
  }

  selectedId = item.dataset.id;
  render();
});

searchInput.addEventListener("input", render);

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.navPage);
  });
});

menuButton.addEventListener("click", () => toggleSidebar());
backdrop.addEventListener("click", () => toggleSidebar(false));

addDocumentButton.addEventListener("click", () => {
  documentForm.reset();
  documentForm.elements.dateReceived.valueAsDate = new Date();
  documentModal.showModal();
});

closeModalButton.addEventListener("click", () => documentModal.close());
closeBarcodeButton.addEventListener("click", () => barcodeModal.close());
closeBarcodeSecondaryButton.addEventListener("click", () => barcodeModal.close());
printBarcodeButton.addEventListener("click", () => window.print());

printSelectedBarcodeButton.addEventListener("click", () => {
  const file = getSelectedFile();
  if (file) {
    openBarcodeDialog(file);
  }
});

releaseFileButton.addEventListener("click", releaseSelectedFile);
startBarcodeScannerButton.addEventListener("click", startBarcodeScanner);
stopBarcodeScannerButton.addEventListener("click", stopBarcodeScanner);

documentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(documentForm);
  try {
    const file = normalizeFiles([await apiRequest("api/files", {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title").trim(),
        origin: formData.get("origin").trim(),
        dateReceived: formData.get("dateReceived"),
        remarks: formData.get("remarks").trim()
      })
    })])[0];

    files = [file, ...files.filter((item) => item.id !== file.id)];
    selectedId = file.id;
    saveFiles();
    render();
    documentModal.close();
    openBarcodeDialog(file);
  } catch (error) {
    showMessage(error.message, true);
  }
});

outgoingForm.addEventListener("input", () => {
  renderLookupCard(outgoingForm.elements.trackingNo.value);
});

outgoingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(outgoingForm);
  await requestFileOutgoing(
    formData.get("trackingNo"),
    formData.get("destination"),
    formData.get("requestedBy"),
    formData.get("remarks")
  );
  outgoingForm.reset();
});

const initialPage = window.location.hash.replace("#", "");
if ([...pageViews].some((page) => page.dataset.page === initialPage)) {
  activePage = initialPage;
}

renderLookupCard();
render();
showPage(activePage);
refreshFiles();
