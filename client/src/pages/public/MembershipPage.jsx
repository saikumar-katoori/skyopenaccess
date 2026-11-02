export const MembershipPage = () => (
  <main>
    <section className="membership-section fade-up">
      <div className="hero-pattern">
        <svg viewBox="0 0 1200 600">
          <path d="M0 300 Q300 200 600 300 T1200 300" />
          <path d="M0 350 Q300 250 600 350 T1200 350" />
          <path d="M0 250 Q300 150 600 250 T1200 250" />
          <path d="M0 400 Q300 300 600 400 T1200 400" />
          <path d="M0 200 Q300 100 600 200 T1200 200" />
        </svg>
      </div>

      <div className="container">
        <div className="membership-header">
          <h2>Membership</h2>
          <p>
            At SKY Open Access Publishers, we deeply value the contributions of our authors and provide
            exclusive benefits that support your publishing journey.
          </p>
        </div>

        <div className="benefits-grid fade-up">
          <div className="benefit-card fade-up">
            <h3>Free Publications</h3>
            <p>Enjoy free publication for one, two, or three years depending on your membership plan.</p>
          </div>

          <div className="benefit-card fade-up">
            <h3>Priority Processing</h3>
            <p>Faster peer review and quicker turnaround from submission to publication.</p>
          </div>

          <div className="benefit-card fade-up">
            <h3>Extended Author Support</h3>
            <p>Continuous guidance from submission to post-publication.</p>
          </div>

          <div className="benefit-card fade-up">
            <h3>Access to All Journals</h3>
            <p>Unrestricted access to all journals published by SKY Open Access Publishers.</p>
          </div>

          <div className="benefit-card fade-up">
            <h3>Networking Opportunities</h3>
            <p>Collaborate with global researchers and professionals.</p>
          </div>

          <div className="benefit-card fade-up">
            <h3>Recognition &amp; Exposure</h3>
            <p>Greater visibility through featured collections and special issues.</p>
          </div>
        </div>

        <div className="plans-section fade-up">
          <div className="plan-card fade-up">
            <h3>Basic Membership</h3>
            <p className="plan-duration">1 Year</p>
            <p>Ideal for new authors looking to publish their first paper with minimal cost.</p>
          </div>

          <div className="plan-card fade-up">
            <h3>Standard Membership</h3>
            <p className="plan-duration">2 Years</p>
            <p>Two years of free publication with priority submission processing.</p>
          </div>

          <div className="plan-card fade-up">
            <h3>Premium Membership</h3>
            <p className="plan-duration">3 Years</p>
            <p>Three years of free publication, discounted future publications, and exclusive resources.</p>
          </div>
        </div>

        <div className="pricing-table fade-up membership-header">
          <h2>Why Membership is Important?</h2>
          <p>
            Membership is crucial for authors who wish to publish their research without the burden of high publication fees. It ensures that your work reaches a wider audience, enhances your academic profile, and provides you with the necessary support throughout the publishing process.
          </p>
        </div>

        <div className="membership-cta fade-up">
          <h3>Ready to Join Us?</h3>
          <p>
            Becoming a member is simple. Choose the plan that suits you and start enjoying the
            benefits immediately.
          </p>
          <a href="mailto:skyopenaccess@gmail.com" className="cta-btn">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  </main>
);
