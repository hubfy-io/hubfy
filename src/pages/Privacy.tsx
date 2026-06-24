import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* Content */}
      <main className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: March 30, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Hubfy ("Company", "we", "us", or "our") operates the website hubfy.io and the Hubfy platform (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or use our Service.
            </p>
            <p>
              We are committed to protecting your privacy and handling your data transparently. Please read this Privacy Policy carefully. By using the Service, you consent to the data practices described in this policy.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>We collect information that you voluntarily provide when using the Service, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Profile picture, bio, and other details you add to your profile</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by our third-party payment processors — we do not store full credit card numbers)</li>
              <li><strong>Creator Content:</strong> Courses, digital products, and other content you upload to the platform</li>
              <li><strong>Communications:</strong> Messages, support requests, and feedback you send to us</li>
            </ul>

            <h3>2.2 Information from Third-Party Authentication</h3>
            <p>
              When you sign in using a third-party authentication provider (such as Google), we receive certain information from that provider, which may include:
            </p>
            <ul>
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your profile picture</li>
              <li>Your unique identifier from the provider</li>
            </ul>
            <p>
              We only request the minimum information necessary to create and manage your account. We do not access your contacts, calendar, or other data from your Google account unless you explicitly grant us permission.
            </p>

            <h3>2.3 Information Collected Automatically</h3>
            <p>When you access the Service, we may automatically collect:</p>
            <ul>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution</li>
              <li><strong>Usage Data:</strong> Pages viewed, features used, clicks, and navigation patterns</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs</li>
              <li><strong>Cookies and Similar Technologies:</strong> We use cookies and local storage to maintain your session, remember your preferences (such as theme settings), and improve the Service</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li><strong>Provide the Service:</strong> Create and manage your account, process transactions, deliver content, and enable platform features</li>
              <li><strong>Improve the Service:</strong> Analyze usage patterns to improve functionality, fix bugs, and develop new features</li>
              <li><strong>Communicate:</strong> Send you account-related notifications, security alerts, and support messages</li>
              <li><strong>Security:</strong> Detect, prevent, and address fraud, abuse, and security issues</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms of Service</li>
              <li><strong>Marketing:</strong> With your consent, send promotional communications about new features or services (you can opt out at any time)</li>
            </ul>
          </section>

          <section>
            <h2>4. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>With Creators:</strong> When you purchase a Creator's product, we share your name and email with the Creator to facilitate the transaction and content delivery</li>
              <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf, including:
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Payment processing (Stripe and other payment providers)</li>
                  <li>Video hosting (Gumlet)</li>
                  <li>Email delivery (Resend)</li>
                  <li>Cloud infrastructure (Supabase)</li>
                  <li>Analytics and monitoring tools</li>
                </ul>
              </li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or other legal process, or when we believe disclosure is necessary to protect our rights, protect your safety, or investigate fraud</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you the Service. If you request account deletion, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal or legitimate business purposes.
            </p>
            <p>
              Creator content and associated customer data will be retained as long as the Creator's account is active. Customers may request deletion of their data by contacting the relevant Creator or by contacting us directly.
            </p>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Row Level Security (RLS) policies on our database ensuring data isolation</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure handling of signed URLs for private content with time-limited access</li>
            </ul>
            <p>
              While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to certain exceptions</li>
              <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
              <li><strong>Objection:</strong> Object to our processing of your personal data</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw consent at any time</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the email provided below. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2>8. Google User Data</h2>
            <p>
              If you sign in with Google, we adhere to Google's API Services User Data Policy, including the Limited Use requirements. Specifically:
            </p>
            <ul>
              <li>We only request access to the data necessary to provide and improve the Service (name, email, and profile picture)</li>
              <li>We do not use Google user data for serving advertisements</li>
              <li>We do not share Google user data with third parties except as necessary to provide the Service, comply with applicable laws, or as part of a merger or acquisition</li>
              <li>We do not use Google user data for purposes unrelated to the Service</li>
              <li>Humans may review Google user data only for security purposes, to comply with applicable law, or for the app's internal operations, and only when the data is aggregated and anonymized</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookies and Tracking Technologies</h2>
            <p>We use the following types of cookies and similar technologies:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for the Service to function properly (authentication, security, preferences like theme selection)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Service to improve user experience</li>
              <li><strong>Local Storage:</strong> Used to store your preferences such as theme settings</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling certain cookies may limit your ability to use some features of the Service.
            </p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence, including the United States and Brazil, where our service providers operate. These countries may have data protection laws that are different from the laws of your country. We ensure appropriate safeguards are in place to protect your information in compliance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>11. Children's Privacy</h2>
            <p>
              The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that a child under 16 has provided us with personal data, we will take steps to delete such information. If you believe that a child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2>12. Brazilian Data Protection (LGPD)</h2>
            <p>
              If you are a resident of Brazil, you have rights under the Lei Geral de Proteção de Dados (LGPD), including the right to access, correct, delete, and port your data. To exercise your rights, contact us using the information below. We will process your request in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2>13. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically. Changes are effective when posted on this page.
            </p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
            <ul>
              <li>Email: support@hubfy.io</li>
              <li>Website: hubfy.io</li>
            </ul>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
