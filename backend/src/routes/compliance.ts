import { Router } from 'express'

const router = Router()

// Privacy Policy endpoint
router.get('/privacy', (req, res) => {
  res.json({
    success: true,
    data: {
      lastUpdated: '2024-06-27',
      version: '1.0',
      summary: 'ClauseGuard is committed to protecting your privacy and maintaining the security of your contract data.',
      sections: {
        dataCollection: 'We collect only necessary contract data for analysis purposes.',
        dataUsage: 'Contract data is processed by IBM Granite AI models and stored securely.',
        dataRetention: 'Contract data is retained for 90 days unless explicitly deleted.',
        dataProtection: 'All data is encrypted in transit and at rest using enterprise-grade security.',
        userRights: 'Users have full control over their data including export and deletion rights.'
      },
      compliance: ['GDPR', 'CCPA', 'SOC2 Type II', 'ISO 27001']
    }
  })
})

// Security Information endpoint
router.get('/security', (req, res) => {
  res.json({
    success: true,
    data: {
      encryption: {
        inTransit: 'TLS 1.3',
        atRest: 'AES-256',
        keyManagement: 'AWS KMS'
      },
      compliance: [
        'SOC 2 Type II',
        'ISO 27001',
        'GDPR Article 32',
        'HIPAA Technical Safeguards'
      ],
      monitoring: {
        securityScanning: '24/7 automated scanning',
        vulnerabilityManagement: 'Weekly security assessments',
        incidentResponse: 'Real-time threat detection and response'
      },
      dataProcessing: {
        location: 'US and EU data centers',
        retention: '90 days (configurable)',
        backup: 'Daily encrypted backups',
        recovery: 'RTO: 4 hours, RPO: 1 hour'
      }
    }
  })
})

// GDPR Compliance endpoint
router.get('/gdpr', (req, res) => {
  res.json({
    success: true,
    data: {
      lawfulBasis: 'Legitimate interest for contract analysis services',
      dataSubjectRights: {
        access: 'Right to access personal data',
        rectification: 'Right to correct inaccurate data',
        erasure: 'Right to deletion (Right to be forgotten)',
        portability: 'Right to data portability',
        objection: 'Right to object to processing'
      },
      dataProtectionOfficer: 'privacy@clauseguard.com',
      supervisoryAuthority: 'Relevant EU data protection authority',
      dataTransfers: 'Standard Contractual Clauses (SCCs) for international transfers',
      retentionPolicy: 'Data retained for 90 days unless legally required otherwise'
    }
  })
})

// Accessibility Statement endpoint
router.get('/accessibility', (req, res) => {
  res.json({
    success: true,
    data: {
      standard: 'WCAG 2.1 AA',
      features: [
        'Keyboard navigation support',
        'Screen reader compatibility',
        'High contrast mode support',
        'Reduced motion support',
        'Focus indicators',
        'Alternative text for images',
        'Semantic HTML structure'
      ],
      testing: {
        automated: 'Lighthouse accessibility audits',
        manual: 'Regular testing with assistive technologies',
        userTesting: 'Feedback from users with disabilities'
      },
      contact: 'accessibility@clauseguard.com'
    }
  })
})

export default router 