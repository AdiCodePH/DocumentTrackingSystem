<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Admin Approval - City Legal Office</title>
  <link rel="stylesheet" href="CSS/main.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Ruda:wght@400..900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-block">
        <img src="images/logo.png?v=20260601-185623" alt="City Legal Office logo" class="logo">
        <div>
          <p class="eyebrow">Panabo City</p>
          <h1>Super Admin</h1>
        </div>
      </div>

      <nav class="side-nav" aria-label="Super admin navigation">
        <a href="super-admin" class="active"><span class="material-icons-outlined">admin_panel_settings</span>Approvals</a>
      </nav>

      <div class="office-card">
        <span class="material-icons-outlined">lock</span>
        <div>
          <strong>Release Control</strong>
          <p>Approve outgoing files before release</p>
        </div>
      </div>
    </aside>

    <header class="header">
      <div>
        <p class="eyebrow">Super Admin Page</p>
        <h2>Outgoing File Approval</h2>
      </div>
      <div class="header-actions">
        <label class="search-field">
          <span class="material-icons-outlined">search</span>
          <input type="search" id="adminSearchInput" placeholder="Search pending approvals">
        </label>
        <a class="secondary-button" href="logout">
          <span class="material-icons-outlined">logout</span>
          Logout
        </a>
      </div>
    </header>

    <main class="main">
      <div class="scan-message" id="adminMessage" role="status" aria-live="polite"></div>

      <section class="summary-grid" aria-label="Approval summary">
        <article class="metric-card">
          <span class="material-icons-outlined">approval</span>
          <p>For Approval</p>
          <strong id="adminPendingCount">0</strong>
        </article>
        <article class="metric-card">
          <span class="material-icons-outlined">outbox</span>
          <p>Authorized Files</p>
          <strong id="adminOutgoingCount">0</strong>
        </article>
        <article class="metric-card">
          <span class="material-icons-outlined">move_to_inbox</span>
          <p>Received Files</p>
          <strong id="adminReceivedCount">0</strong>
        </article>
        <article class="metric-card">
          <span class="material-icons-outlined">inventory_2</span>
          <p>Total Files</p>
          <strong id="adminTotalCount">0</strong>
        </article>
      </section>

      <section class="alerts-grid">
        <section class="panel">
          <div class="panel-header compact">
            <div>
              <p class="eyebrow">For Approval</p>
              <h3>For Approval</h3>
            </div>
          </div>
          <div class="approval-list" id="adminApprovalList"></div>
        </section>

        <section class="panel">
          <div class="panel-header compact">
            <div>
              <p class="eyebrow">Policy</p>
              <h3>Approval Rule</h3>
            </div>
          </div>
          <div class="scanner-panel">
            <span class="material-icons-outlined">admin_panel_settings</span>
            <strong>Super Admin approval required</strong>
            <p>Release requests from staff remain pending here. Approving a request marks the file as outgoing. Returning a request sends it back to received status.</p>
          </div>
        </section>
      </section>

      <section class="panel history-panel">
        <div class="panel-header compact">
          <div>
            <p class="eyebrow">History</p>
            <h3>Approved Documents</h3>
          </div>
        </div>
        <div class="approval-list history-list" id="adminApprovedHistory"></div>
      </section>
    </main>
  </div>

  <script src="Js/super-admin.js"></script>
</body>
</html>
