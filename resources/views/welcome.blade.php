<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City Legal Office File Registry</title>
  <link rel="stylesheet" href="CSS/main.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Ruda:wght@400..900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand-block">
        <img src="images/logo.png?v=20260601-185623" alt="City Legal Office logo" class="logo">
        <div>
          <p class="eyebrow">Panabo City</p>
          <h1>Legal Office</h1>
        </div>
      </div>

      <nav class="side-nav" aria-label="Main navigation">
        <a href="#dashboard" class="active" data-nav-page="dashboard"><span class="material-icons-outlined">dashboard</span>Dashboard</a>
        <a href="#received" data-nav-page="received"><span class="material-icons-outlined">move_to_inbox</span>Received Files</a>
        <a href="#outgoing" data-nav-page="outgoing"><span class="material-icons-outlined">outbox</span>Outgoing Files</a>
        <a href="#mark-outgoing" data-nav-page="mark-outgoing"><span class="material-icons-outlined">edit_note</span>Outgoing</a>
        @if (auth()->user()->role === 'super-admin')
          <a href="super-admin"><span class="material-icons-outlined">admin_panel_settings</span>Super Admin</a>
        @endif
        <a href="#reports" data-nav-page="reports"><span class="material-icons-outlined">bar_chart</span>Reports</a>
      </nav>

      <div class="office-card">
        <span class="material-icons-outlined">verified_user</span>
        <div>
          <strong>Registry Desk</strong>
          <p>Received and outgoing file log</p>
        </div>
      </div>
    </aside>

    <div class="backdrop" id="backdrop"></div>

    <header class="header">
      <button class="icon-button menu-button" id="menuButton" aria-label="Open sidebar">
        <span class="material-icons-outlined">menu</span>
      </button>
      <div>
        <p class="eyebrow">File Registry System</p>
        <h2>City Legal Office Panabo</h2>
      </div>
      <div class="header-actions">
        <label class="search-field">
          <span class="material-icons-outlined">search</span>
          <input type="search" id="searchInput" placeholder="Search files or tracking no.">
        </label>
        <button class="primary-button" id="addDocumentButton">
          <span class="material-icons-outlined">add</span>
          Record Received File
        </button>
        <a class="secondary-button" href="logout">
          <span class="material-icons-outlined">logout</span>
          Logout
        </a>
      </div>
    </header>

    <main class="main">
      <div class="scan-message" id="systemMessage" role="status" aria-live="polite"></div>

      <section class="page-view active" id="dashboard" data-page="dashboard">
        <section class="summary-grid" aria-label="File registry summary">
          <article class="metric-card">
            <span class="material-icons-outlined">inventory_2</span>
            <p>Total Files</p>
            <strong id="totalCount">0</strong>
          </article>
          <article class="metric-card">
            <span class="material-icons-outlined">move_to_inbox</span>
            <p>Received Files</p>
            <strong id="receivedCount">0</strong>
          </article>
          <article class="metric-card">
            <span class="material-icons-outlined">outbox</span>
            <p>Authorized Files</p>
            <strong id="outgoingCount">0</strong>
          </article>
          <article class="metric-card">
            <span class="material-icons-outlined">approval</span>
            <p>For Approval</p>
            <strong id="pendingApprovalCount">0</strong>
          </article>
        </section>

        <section class="dashboard-grid">
          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Registry</p>
                <h3>Recent Files</h3>
              </div>
            </div>
            <div class="compact-list" id="dashboardRows"></div>
          </section>

          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Outgoing</p>
                <h3>For Approval / Authorized Documents</h3>
              </div>
            </div>
            <div class="priority-list" id="dashboardOutgoingList"></div>
          </section>
        </section>
      </section>

      <section class="page-view" id="received" data-page="received">
        <section class="panel document-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Incoming Registry</p>
              <h3>Received Files</h3>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tracking No.</th>
                  <th>File</th>
                  <th>From Office</th>
                  <th>Requested By</th>
                  <th>Date Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="receivedRows"></tbody>
            </table>
          </div>
        </section>
      </section>

      <section class="page-view" id="outgoing" data-page="outgoing">
        <section class="routing-grid">
          <aside class="panel details-panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Selected File</p>
                <h3 id="selectedTitle">Select a file</h3>
              </div>
            </div>
            <div class="detail-card">
              <span class="detail-label">Current Status</span>
              <strong id="selectedStatus">-</strong>
              <span class="detail-label">Tracking Number</span>
              <strong id="selectedTracking">-</strong>
              <span class="detail-label">Destination / Requester</span>
              <strong id="selectedDestination">-</strong>
            </div>
            <div class="barcode-card">
              <div class="barcode-preview" id="selectedBarcodePreview"></div>
              <button class="primary-button" id="releaseFileButton" type="button" hidden>
                <span class="material-icons-outlined">task_alt</span>
                Release File
              </button>
              <button class="secondary-button" id="printSelectedBarcodeButton" type="button">
                <span class="material-icons-outlined">print</span>
                Print Barcode
              </button>
            </div>
            <div class="timeline" id="timelineList"></div>
          </aside>

          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Outgoing Registry</p>
                <h3>For Approval / Authorized Documents</h3>
              </div>
            </div>
            <div class="route-list" id="outgoingList"></div>
          </section>
        </section>
      </section>

      <section class="page-view" id="mark-outgoing" data-page="mark-outgoing">
        <section class="alerts-grid">
          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Outgoing Request</p>
                <h3>Request File Release</h3>
              </div>
            </div>
            <form class="registry-form" id="outgoingForm">
              <label>
                Tracking number
                <div class="scan-input-row">
                  <input name="trackingNo" required placeholder="e.g. CLO-2026-0142">
                  <button class="secondary-button" id="startBarcodeScannerButton" type="button">
                    <span class="material-icons-outlined">qr_code_scanner</span>
                    Scan
                  </button>
                </div>
              </label>
              <div class="camera-scanner" id="cameraScanner" hidden>
                <div class="camera-frame">
                  <video id="barcodeScannerVideo" autoplay muted playsinline></video>
                  <div class="scan-guide" aria-hidden="true"></div>
                </div>
                <div class="scanner-actions">
                  <span id="barcodeScannerStatus">Point the camera at the barcode.</span>
                  <button class="secondary-button" id="stopBarcodeScannerButton" type="button">Stop Scanner</button>
                </div>
              </div>
              <label>
                Going to / released to
                <input name="destination" required placeholder="e.g. Mayor's Office">
              </label>
              <label>
                Requested by, if applicable
                <input name="requestedBy" placeholder="e.g. Juan Dela Cruz">
              </label>
              <label>
                Remarks
                <textarea name="remarks" rows="3" placeholder="Optional release notes"></textarea>
              </label>
              <button class="primary-button" type="submit">
                <span class="material-icons-outlined">outbox</span>
                Mark Outgoing for Approval
              </button>
            </form>
          </section>

          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Reference</p>
                <h3>File Details</h3>
              </div>
            </div>
            <div class="detail-card lookup-card" id="lookupCard">
              <span class="detail-label">Tracking number</span>
              <strong>-</strong>
              <span class="detail-label">File title</span>
              <strong>-</strong>
              <span class="detail-label">Current status</span>
              <strong>-</strong>
            </div>
          </section>
        </section>
      </section>

      <section class="page-view" id="reports" data-page="reports">
        <section class="reports-grid">
          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Report</p>
                <h3>Weekly File Activity</h3>
              </div>
            </div>
            <div class="bar-chart" aria-label="Weekly file activity">
              <div style="--bar: 62%"><span>Mon</span></div>
              <div style="--bar: 74%"><span>Tue</span></div>
              <div style="--bar: 48%"><span>Wed</span></div>
              <div style="--bar: 86%"><span>Thu</span></div>
              <div style="--bar: 57%"><span>Fri</span></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-header compact">
              <div>
                <p class="eyebrow">Breakdown</p>
                <h3>File Status</h3>
              </div>
            </div>
            <div class="report-stack" id="reportStack"></div>
          </section>
        </section>
      </section>
    </main>
  </div>

  <dialog class="document-modal" id="documentModal">
    <form id="documentForm" method="dialog">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Received Entry</p>
          <h3>Record Received File</h3>
        </div>
        <button class="icon-button" id="closeModalButton" type="button" aria-label="Close dialog">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>

      <label>
        File title
        <input name="title" required placeholder="e.g. Legal Opinion Request">
      </label>
      <label>
        From office
        <input name="origin" required placeholder="e.g. Mayor's Office">
      </label>
      <label>
        Date received
        <input name="dateReceived" type="date" required>
      </label>
      <label>
        Remarks
        <textarea name="remarks" rows="3" placeholder="Optional notes"></textarea>
      </label>
      <button class="primary-button" type="submit">
        <span class="material-icons-outlined">save</span>
        Save and Generate Barcode
      </button>
    </form>
  </dialog>

  <dialog class="barcode-modal" id="barcodeModal">
    <div class="modal-header">
      <div>
        <p class="eyebrow">Print Label</p>
        <h3>Generated Barcode</h3>
      </div>
      <button class="icon-button" id="closeBarcodeButton" type="button" aria-label="Close barcode dialog">
        <span class="material-icons-outlined">close</span>
      </button>
    </div>

    <article class="barcode-print-area" id="barcodePrintArea">
      <p class="eyebrow">City Legal Office Panabo</p>
      <h3 id="barcodeDocumentTitle">File Title</h3>
      <div class="barcode-large" id="barcodeLarge"></div>
      <strong id="barcodeTrackingNumber">CLO-2026-0000</strong>
      <p id="barcodeDocumentMeta">From office</p>
    </article>

    <div class="modal-actions">
      <button class="secondary-button" id="closeBarcodeSecondaryButton" type="button">Close</button>
      <button class="primary-button" id="printBarcodeButton" type="button">
        <span class="material-icons-outlined">print</span>
        Print Barcode
      </button>
    </div>
  </dialog>

  <script src="Js/Script.js"></script>
</body>
</html>
