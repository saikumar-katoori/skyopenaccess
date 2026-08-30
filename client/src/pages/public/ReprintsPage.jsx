export const ReprintsPage = () => (
  <main>
    <section className="reprints-hero fade-up">
      <div className="reprints-hero-content">
        <h4 className="reprints-tagline">SKY OPEN ACCESS PUBLISHING</h4>
        <h1 className="reprints-title">Order Your Reprints</h1>
        <p className="reprints-description">
          High-quality printed copies of your important scientific articles and research papers —
          crafted for scholars, conferences, and academic archives.
        </p>
      </div>
    </section>

    <section className="reprints-steps fade-up">
      <h2 className="reprints-section-title">How to Order Reprints</h2>

      <div className="reprints-steps-container">
        <div className="reprints-step-card">
          <span className="reprints-step-number">01</span>
          <h4 className="reprints-step-title">Select Quantity</h4>
          <p className="reprints-step-text">
            Choose how many copies of the reprint you need for your distribution.
          </p>
        </div>

        <div className="reprints-step-card">
          <span className="reprints-step-number">02</span>
          <h4 className="reprints-step-title">Provide Shipping Address</h4>
          <p className="reprints-step-text">
            Enter your full shipping address and contact details accurately.
          </p>
        </div>

        <div className="reprints-step-card">
          <span className="reprints-step-number">03</span>
          <h4 className="reprints-step-title">Complete Payment</h4>
          <p className="reprints-step-text">Make payment securely according to the pricing details provided.</p>
        </div>
      </div>
    </section>

    <section className="reprints-benefits fade-up">
      <div className="reprints-benefits-container">
        <div className="reprints-benefits-text">
          <h2 className="reprints-benefits-title">Benefits of Ordering</h2>

          <ul className="reprints-benefits-list">
            <li>Share your research with colleagues and institutions</li>
            <li>Use printed copies for conferences and presentations</li>
            <li>Preserve your work for academic archives</li>
            <li>High-quality professional printing guaranteed</li>
            <li>Fast turnaround for urgent academic deadlines</li>
            <li>Bulk discounts available for large orders</li>
          </ul>
        </div>

        <div className="reprints-benefits-image fade-up">
          <img src="/images/reprints.svg" alt="Journal Sample" />
        </div>
      </div>
    </section>
  </main>
);
