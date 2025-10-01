# AHCP Dashboard Component Examples

## Navigation Components

### Top Navigation Bar
```tsx
// Top Navigation Bar
<nav className="bg-card border-b border-border px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <h1 className="text-xl font-bold text-primary">AHCP Dashboard</h1>
    </div>
    <div className="flex items-center space-x-4">
      <button className="btn btn-ghost btn-sm">
        <User className="w-4 h-4" />
        Profile
      </button>
      <button className="btn btn-ghost btn-sm">
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </div>
</nav>
```

### Sidebar Navigation
```tsx
// Sidebar Navigation
<aside className="sidebar w-64 h-screen">
  <div className="sidebar-header">
    <h2 className="text-lg font-semibold">Dashboard</h2>
  </div>
  <nav className="sidebar-nav">
    <ul className="space-y-2">
      <li>
        <a href="/dashboard" className="nav-link active">
          <Home className="w-5 h-5" />
          Dashboard
        </a>
      </li>
      <li>
        <a href="/clients" className="nav-link">
          <Users className="w-5 h-5" />
          Clients
        </a>
      </li>
      <li>
        <a href="/vaccination" className="nav-link">
          <Shield className="w-5 h-5" />
          Vaccination
        </a>
      </li>
      <li>
        <a href="/reports" className="nav-link">
          <BarChart className="w-5 h-5" />
          Reports
        </a>
      </li>
    </ul>
  </nav>
</aside>
```

## Card Components

### Statistics Cards
```tsx
// Statistics Card
<div className="stats-card">
  <div className="flex items-center justify-between">
    <div>
      <p className="stats-label">Total Clients</p>
      <p className="stats-value">1,234</p>
      <div className="stats-change positive">
        <TrendingUp className="w-4 h-4" />
        +12.5%
      </div>
    </div>
    <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
      <Users className="w-6 h-6 text-primary" />
    </div>
  </div>
</div>
```

### Data Cards
```tsx
// Data Card with Header and Content
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Recent Vaccinations</h3>
    <p className="text-sm text-muted">Last 30 days</p>
  </div>
  <div className="card-content">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Horse Vaccination</span>
        <span className="text-sm font-medium">45</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Cattle Vaccination</span>
        <span className="text-sm font-medium">32</span>
      </div>
    </div>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary btn-sm">View All</button>
  </div>
</div>
```

## Table Components

### Professional Data Table
```tsx
// Professional Data Table
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th className="table-col-id">ID</th>
        <th className="table-col-name">Name</th>
        <th className="table-col-email">Email</th>
        <th className="table-col-date">Date</th>
        <th className="table-col-status">Status</th>
        <th className="table-col-actions">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>001</td>
        <td>Ahmed Hassan</td>
        <td>ahmed@example.com</td>
        <td>2024-01-15</td>
        <td>
          <span className="table-status active">Active</span>
        </td>
        <td>
          <div className="table-actions">
            <button className="btn btn-ghost btn-sm">
              <Edit className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm">
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      <tr>
        <td>002</td>
        <td>Fatima Ali</td>
        <td>fatima@example.com</td>
        <td>2024-01-14</td>
        <td>
          <span className="table-status pending">Pending</span>
        </td>
        <td>
          <div className="table-actions">
            <button className="btn btn-ghost btn-sm">
              <Edit className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm">
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Form Components

### Professional Form
```tsx
// Professional Form
<form className="space-y-6">
  <div className="form-group">
    <label className="form-label">Full Name</label>
    <input 
      type="text" 
      className="form-input" 
      placeholder="Enter full name"
    />
  </div>
  
  <div className="form-group">
    <label className="form-label">Email Address</label>
    <input 
      type="email" 
      className="form-input" 
      placeholder="Enter email address"
    />
  </div>
  
  <div className="form-group">
    <label className="form-label">Phone Number</label>
    <input 
      type="tel" 
      className="form-input" 
      placeholder="Enter phone number"
    />
  </div>
  
  <div className="form-group">
    <label className="form-label">Status</label>
    <select className="form-input">
      <option value="">Select status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="pending">Pending</option>
    </select>
  </div>
  
  <div className="form-group">
    <label className="form-label">Notes</label>
    <textarea 
      className="form-input" 
      rows={4}
      placeholder="Enter additional notes"
    />
  </div>
  
  <div className="flex space-x-4">
    <button type="submit" className="btn btn-primary">
      Save Changes
    </button>
    <button type="button" className="btn btn-secondary">
      Cancel
    </button>
  </div>
</form>
```

### Form with Validation States
```tsx
// Form with Validation States
<form className="space-y-6">
  <div className="form-group">
    <label className="form-label">Email Address</label>
    <input 
      type="email" 
      className="form-input success" 
      placeholder="Enter email address"
      defaultValue="user@example.com"
    />
    <div className="form-success">
      <CheckCircle className="w-4 h-4" />
      Email is valid
    </div>
  </div>
  
  <div className="form-group">
    <label className="form-label">Password</label>
    <input 
      type="password" 
      className="form-input error" 
      placeholder="Enter password"
    />
    <div className="form-error">
      <AlertCircle className="w-4 h-4" />
      Password must be at least 8 characters
    </div>
  </div>
</form>
```

## Button Components

### Button Variants
```tsx
// Button Variants
<div className="space-y-4">
  <div className="flex space-x-4">
    <button className="btn btn-primary">Primary</button>
    <button className="btn btn-secondary">Secondary</button>
    <button className="btn btn-success">Success</button>
    <button className="btn btn-warning">Warning</button>
    <button className="btn btn-danger">Danger</button>
    <button className="btn btn-info">Info</button>
  </div>
  
  <div className="flex space-x-4">
    <button className="btn btn-outline">Outline</button>
    <button className="btn btn-ghost">Ghost</button>
  </div>
  
  <div className="flex space-x-4">
    <button className="btn btn-primary btn-sm">Small</button>
    <button className="btn btn-primary">Default</button>
    <button className="btn btn-primary btn-lg">Large</button>
  </div>
  
  <div className="flex space-x-4">
    <button className="btn btn-primary" disabled>Disabled</button>
    <button className="btn btn-primary loading">Loading</button>
  </div>
</div>
```

## Alert Components

### Alert Variants
```tsx
// Alert Components
<div className="space-y-4">
  <div className="alert alert-success">
    <CheckCircle className="w-5 h-5" />
    <div>
      <h4 className="font-semibold">Success!</h4>
      <p>Your changes have been saved successfully.</p>
    </div>
  </div>
  
  <div className="alert alert-warning">
    <AlertTriangle className="w-5 h-5" />
    <div>
      <h4 className="font-semibold">Warning</h4>
      <p>Please review your information before proceeding.</p>
    </div>
  </div>
  
  <div className="alert alert-danger">
    <AlertCircle className="w-5 h-5" />
    <div>
      <h4 className="font-semibold">Error</h4>
      <p>Something went wrong. Please try again.</p>
    </div>
  </div>
  
  <div className="alert alert-info">
    <Info className="w-5 h-5" />
    <div>
      <h4 className="font-semibold">Information</h4>
      <p>This feature is currently in development.</p>
    </div>
  </div>
</div>
```

## Dashboard Layout

### Complete Dashboard Layout
```tsx
// Complete Dashboard Layout
<div className="min-h-screen bg-bg-main">
  {/* Top Navigation */}
  <nav className="bg-card border-b border-border px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-primary">AHCP Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="btn btn-ghost btn-sm">
          <User className="w-4 h-4" />
          Profile
        </button>
        <button className="btn btn-ghost btn-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </nav>

  <div className="flex">
    {/* Sidebar */}
    <aside className="sidebar w-64 h-screen">
      <div className="sidebar-header">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <nav className="sidebar-nav">
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="nav-link active">
              <Home className="w-5 h-5" />
              Dashboard
            </a>
          </li>
          <li>
            <a href="/clients" className="nav-link">
              <Users className="w-5 h-5" />
              Clients
            </a>
          </li>
          <li>
            <a href="/vaccination" className="nav-link">
              <Shield className="w-5 h-5" />
              Vaccination
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    {/* Main Content */}
    <main className="flex-1 p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted">Welcome to your AHCP dashboard</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Total Clients</p>
                <p className="stats-value">1,234</p>
                <div className="stats-change positive">
                  <TrendingUp className="w-4 h-4" />
                  +12.5%
                </div>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Vaccinations</p>
                <p className="stats-value">456</p>
                <div className="stats-change positive">
                  <TrendingUp className="w-4 h-4" />
                  +8.2%
                </div>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activities</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New client registered</span>
                  <span className="text-xs text-muted">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vaccination completed</span>
                  <span className="text-xs text-muted">4 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Utility Classes

### Color Utilities
```tsx
// Color Utilities
<div className="space-y-4">
  <div className="text-primary">Primary Text</div>
  <div className="text-success">Success Text</div>
  <div className="text-warning">Warning Text</div>
  <div className="text-danger">Danger Text</div>
  <div className="text-muted">Muted Text</div>
</div>

<div className="space-y-4">
  <div className="bg-primary text-white p-4 rounded">Primary Background</div>
  <div className="bg-success text-white p-4 rounded">Success Background</div>
  <div className="bg-warning text-white p-4 rounded">Warning Background</div>
  <div className="bg-danger text-white p-4 rounded">Danger Background</div>
</div>
```

### Spacing Utilities
```tsx
// Spacing Utilities
<div className="space-y-4">
  <div className="p-xs bg-light rounded">Extra Small Padding</div>
  <div className="p-sm bg-light rounded">Small Padding</div>
  <div className="p-md bg-light rounded">Medium Padding</div>
  <div className="p-lg bg-light rounded">Large Padding</div>
  <div className="p-xl bg-light rounded">Extra Large Padding</div>
</div>
```

### Border and Shadow Utilities
```tsx
// Border and Shadow Utilities
<div className="space-y-4">
  <div className="p-4 border border-primary rounded-sm">Small Border Radius</div>
  <div className="p-4 border border-primary rounded-md">Medium Border Radius</div>
  <div className="p-4 border border-primary rounded-lg">Large Border Radius</div>
  <div className="p-4 border border-primary rounded-xl">Extra Large Border Radius</div>
</div>

<div className="space-y-4">
  <div className="p-4 bg-card shadow-sm rounded">Small Shadow</div>
  <div className="p-4 bg-card shadow-md rounded">Medium Shadow</div>
  <div className="p-4 bg-card shadow-lg rounded">Large Shadow</div>
  <div className="p-4 bg-card shadow-xl rounded">Extra Large Shadow</div>
</div>
```
