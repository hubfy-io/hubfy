import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* Content */}
      <main className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: March 30, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              Welcome to Hubfy ("Company", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our website at hubfy.io, our platform, applications, and all related services (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service, including content creators ("Creators") and their end-users ("Customers").
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              Hubfy is a platform that enables Creators to build, manage, and sell digital products and services, including but not limited to:
            </p>
            <ul>
              <li>Online courses and educational content</li>
              <li>Coaching and mentoring programs</li>
              <li>Digital downloads (e-books, templates, resources)</li>
              <li>Membership and subscription-based communities</li>
              <li>Payment processing and checkout experiences</li>
            </ul>
            <p>
              We provide the technology infrastructure and tools for Creators to deliver their content and manage their businesses. We are not responsible for the content, products, or services offered by Creators through our platform.
            </p>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of the Service, you must register for an account. You may register using your email address and password or through third-party authentication providers such as Google. When you register, you agree to provide accurate, current, and complete information.
            </p>
            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss arising from unauthorized use of your account.
            </p>
            <h3>3.3 Account Eligibility</h3>
            <p>
              You must be at least 18 years old to create a Creator account. Customer accounts may be created by individuals of at least 16 years of age, or the minimum age required in their jurisdiction. By creating an account, you represent that you meet these age requirements.
            </p>
          </section>

          <section>
            <h2>4. Creator Terms</h2>
            <h3>4.1 Creator Responsibilities</h3>
            <p>
              As a Creator, you are solely responsible for the content you publish, the products you sell, and the services you offer through the platform. You agree to:
            </p>
            <ul>
              <li>Comply with all applicable laws and regulations</li>
              <li>Provide accurate descriptions of your products and services</li>
              <li>Deliver the products and services as described</li>
              <li>Handle customer support for your products and services</li>
              <li>Comply with applicable consumer protection and refund laws</li>
            </ul>
            <h3>4.2 Content Ownership</h3>
            <p>
              You retain all rights to the content you create and upload to the platform. By uploading content, you grant Hubfy a non-exclusive, worldwide, royalty-free license to host, store, transmit, and display your content solely for the purpose of providing the Service.
            </p>
            <h3>4.3 Prohibited Content</h3>
            <p>Creators may not upload or sell content that:</p>
            <ul>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains illegal, harmful, or misleading material</li>
              <li>Violates any applicable law or regulation</li>
              <li>Contains malware, viruses, or other harmful code</li>
              <li>Promotes discrimination, harassment, or violence</li>
            </ul>
          </section>

          <section>
            <h2>5. Customer Terms</h2>
            <h3>5.1 Purchases</h3>
            <p>
              When you purchase a product or service through the platform, you are entering into a transaction directly with the Creator. Hubfy facilitates the transaction but is not a party to the agreement between you and the Creator.
            </p>
            <h3>5.2 Access to Content</h3>
            <p>
              Your access to purchased content is subject to the Creator's terms and the continued availability of the content on the platform. Hubfy does not guarantee that content will be available indefinitely.
            </p>
            <h3>5.3 Refunds</h3>
            <p>
              Refund policies are determined by individual Creators and applicable law. Hubfy may facilitate refunds on behalf of Creators but is not obligated to issue refunds for Creator products or services.
            </p>
          </section>

          <section>
            <h2>6. Payments and Fees</h2>
            <h3>6.1 Platform Fees</h3>
            <p>
              Hubfy charges Creators fees for the use of the platform as described in our pricing page. We reserve the right to change our fees upon reasonable notice. Continued use of the Service after fee changes constitutes acceptance of the new fees.
            </p>
            <h3>6.2 Payment Processing</h3>
            <p>
              Payment processing services are provided by third-party payment processors. By using our payment features, you agree to be bound by the payment processor's terms of service. Hubfy is not responsible for errors or issues caused by third-party payment processors.
            </p>
            <h3>6.3 Taxes</h3>
            <p>
              Creators are responsible for determining and paying any taxes applicable to the sale of their products and services. Hubfy does not provide tax advice.
            </p>
          </section>

          <section>
            <h2>7. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Hubfy and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2>8. Third-Party Authentication</h2>
            <p>
              The Service allows you to sign in using third-party authentication providers, including Google. By using third-party authentication, you authorize us to access certain account information from that provider, such as your name and email address, in accordance with that provider's terms and our Privacy Policy. Your use of third-party authentication is subject to that provider's terms of service.
            </p>
          </section>

          <section>
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for conduct that we determine, in our sole discretion, violates these Terms, is harmful to other users or the Service, or for any other reason. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p>
              Creators may cancel their accounts at any time. Upon cancellation, you will lose access to Creator features at the end of your current billing period. Customer access to purchased content may be affected by a Creator's termination.
            </p>
          </section>

          <section>
            <h2>10. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. We do not warrant the accuracy or reliability of any content obtained through the Service. Creator content and products are not endorsed by Hubfy.
            </p>
          </section>

          <section>
            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HUBFY, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.
            </p>
          </section>

          <section>
            <h2>12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Hubfy and its licensors, employees, contractors, agents, officers, and directors from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federative Republic of Brazil, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be submitted to the competent courts of Brazil.
            </p>
          </section>

          <section>
            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use the Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2>15. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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
