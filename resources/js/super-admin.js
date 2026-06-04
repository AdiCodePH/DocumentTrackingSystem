const storageKey = "clo-file-registry";
const legacyStorageKey = "clo-documents";

let files = normalizeFiles(loadFiles());

const approvalList = document.getElementById("adminApprovalList");
const approvedHistory = document.getElementById("adminApprovedHistory");
const searchInput = document.getElementById("adminSearchInput");
const message = document.getElementById("adminMessage");

function loadFiles() {
  const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
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
      outgoingDate: item.outgoingDate || "",
      remarks: item.remarks || "",
      timeline: item.timeline?.length ? item.timeline : []
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
    saveFiles();
    render();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
  message.classList.add("show");

  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    message.classList.remove("show", "error");
    message.textContent = "";
  }, 3600);
}

function getPendingApprovals() {
  const query = searchInput.value.trim().toLowerCase();
  return files.filter((file) => {
    const isPending = file.status === "pending-approval";
    const matchesQuery = [file.id, file.title, file.origin, file.destination, file.requestedBy]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return isPending && matchesQuery;
  });
}

function getApprovedHistory() {
  const query = searchInput.value.trim().toLowerCase();
  return files.filter((file) => {
    const isApproved = file.status === "outgoing" || file.status === "released";
    const matchesQuery = [file.id, file.title, file.origin, file.destination, file.requestedBy]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return isApproved && matchesQuery;
  });
}

function statusLabel(file) {
  return file.status === "released" ? "Released" : "Authorized";
}

function getApprovalTimeline(file) {
  const approved = [...file.timeline].reverse().find((item) => item[0] === "Approved by Super Admin");
  return approved?.[2] || file.outgoingDate || "-";
}

function renderMetrics() {
  document.getElementById("adminPendingCount").textContent = files.filter((file) => file.status === "pending-approval").length;
  document.getElementById("adminOutgoingCount").textContent = files.filter((file) => file.status === "outgoing" || file.status === "released").length;
  document.getElementById("adminReceivedCount").textContent = files.filter((file) => file.status === "received").length;
  document.getElementById("adminTotalCount").textContent = files.length;
}

function renderApprovals() {
  const pending = getPendingApprovals();
  approvalList.innerHTML = pending.length ? pending.map((file) => `
    <article class="approval-item" data-id="${escapeHtml(file.id)}">
      <div>
        <strong>${escapeHtml(file.title)}</strong>
        <p>${escapeHtml(file.id)} - ${escapeHtml(file.destination || "No destination")}</p>
        <p>From: ${escapeHtml(file.origin)}</p>
        <p>Requested by: ${escapeHtml(file.requestedBy || "-")}</p>
        ${file.remarks ? `<p>Remarks: ${escapeHtml(file.remarks)}</p>` : ""}
      </div>
      <div class="approval-actions">
        <button class="primary-button" type="button" data-approve-id="${escapeHtml(file.id)}">
          <span class="material-icons-outlined">check_circle</span>
          Approve Release
        </button>
        <button class="secondary-button" type="button" data-deny-id="${escapeHtml(file.id)}">
          <span class="material-icons-outlined">cancel</span>
          Return to Received
        </button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No outgoing files are waiting for approval.</div>`;
}

function renderApprovedHistory() {
  const approved = getApprovedHistory();
  approvedHistory.innerHTML = approved.length ? approved.map((file) => `
    <article class="approval-item history-item" data-id="${escapeHtml(file.id)}">
      <div>
        <div class="history-title-row">
          <strong>${escapeHtml(file.title)}</strong>
          <span class="status-pill ${file.status === "released" ? "status-released" : "status-outgoing"}">${statusLabel(file)}</span>
        </div>
        <p>${escapeHtml(file.id)} - ${escapeHtml(file.destination || "No destination")}</p>
        <p>From: ${escapeHtml(file.origin)}</p>
        <p>Requested by: ${escapeHtml(file.requestedBy || "-")}</p>
        <p>Approved: ${escapeHtml(getApprovalTimeline(file))}</p>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No approved documents match the current search.</div>`;
}

function render() {
  renderMetrics();
  renderApprovals();
  renderApprovedHistory();
}

async function approveRelease(fileId) {
  const file = files.find((item) => item.id === fileId);
  if (!file) {
    showMessage("The selected file could not be found.", true);
    return;
  }

  try {
    const updatedFile = normalizeFiles([await apiRequest(`api/files/${encodeURIComponent(file.id)}/approve-release`, {
      method: "PATCH"
    })])[0];
    files = files.map((item) => item.id === updatedFile.id ? updatedFile : item);
    saveFiles();
    render();
    showMessage(`Approved and released: ${updatedFile.id} - ${updatedFile.title}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function returnToReceived(fileId) {
  const file = files.find((item) => item.id === fileId);
  if (!file) {
    showMessage("The selected file could not be found.", true);
    return;
  }

  try {
    const updatedFile = normalizeFiles([await apiRequest(`api/files/${encodeURIComponent(file.id)}/return-to-received`, {
      method: "PATCH"
    })])[0];
    files = files.map((item) => item.id === updatedFile.id ? updatedFile : item);
    saveFiles();
    render();
    showMessage(`Returned to received: ${updatedFile.id} - ${updatedFile.title}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

approvalList.addEventListener("click", (event) => {
  const approveButton = event.target.closest("[data-approve-id]");
  const denyButton = event.target.closest("[data-deny-id]");

  if (approveButton) {
    approveRelease(approveButton.dataset.approveId);
    return;
  }

  if (denyButton) {
    returnToReceived(denyButton.dataset.denyId);
  }
});

searchInput.addEventListener("input", render);

render();
refreshFiles();
