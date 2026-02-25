import React from 'react'
import Link from 'next/link'
import './styles.css'

export default function HomePage() {
  return (
    <div className="home">
      <div className="content">
        <h1>Multi-Tenant CMS</h1>
        <p className="subtitle">Manage multiple websites from a single admin panel</p>

        <div className="tenant-cards">
          <a href="http://localhost:3001" className="tenant-card misrut-card">
            <h2>Misrut</h2>
            <p>Visit Misrut Blog →</p>
            <span className="port">localhost:3001</span>
          </a>
          <a href="http://localhost:3002" className="tenant-card synrgy-card">
            <h2>Synrgy</h2>
            <p>Visit Synrgy Blog →</p>
            <span className="port">localhost:3002</span>
          </a>
        </div>

        <div className="links">
          <Link className="admin" href="/admin">
            Go to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
