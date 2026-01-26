// Seed data for the CRM API
// This is imported from the frontend's mock data

import type { Contact, Company, Deal, Activity, Settings } from './types';

export const seedContacts: Contact[] = [
  {
    "id": "c1",
    "firstName": "Sarah",
    "lastName": "Chen",
    "email": "sarah.chen@techcorp.io",
    "phone": "+1 (415) 555-0123",
    "company": "TechCorp Industries",
    "companyId": "comp1",
    "status": "active",
    "jobTitle": "VP of Engineering",
    "lastActivity": "2026-01-24",
    "createdAt": "2025-06-15"
  },
  {
    "id": "c2",
    "firstName": "Marcus",
    "lastName": "Johnson",
    "email": "m.johnson@innovate.com",
    "phone": "+1 (212) 555-0456",
    "company": "Innovate Solutions",
    "companyId": "comp2",
    "status": "lead",
    "jobTitle": "Director of Operations",
    "lastActivity": "2026-01-22",
    "createdAt": "2025-09-03"
  },
  {
    "id": "c3",
    "firstName": "Emily",
    "lastName": "Rodriguez",
    "email": "emily.r@globalfin.co",
    "phone": "+1 (312) 555-0789",
    "company": "Global Finance Group",
    "companyId": "comp3",
    "status": "active",
    "jobTitle": "Chief Financial Officer",
    "lastActivity": "2026-01-25",
    "createdAt": "2025-03-22"
  },
  {
    "id": "c4",
    "firstName": "James",
    "lastName": "Williams",
    "email": "jwilliams@startup.io",
    "phone": "+1 (650) 555-0321",
    "company": "StartUp Ventures",
    "companyId": "comp4",
    "status": "inactive",
    "jobTitle": "Founder & CEO",
    "lastActivity": "2025-11-15",
    "createdAt": "2025-01-10"
  },
  {
    "id": "c5",
    "firstName": "Aisha",
    "lastName": "Patel",
    "email": "aisha.patel@healthtech.com",
    "phone": "+1 (617) 555-0654",
    "company": "HealthTech Solutions",
    "companyId": "comp5",
    "status": "active",
    "jobTitle": "Product Manager",
    "lastActivity": "2026-01-23",
    "createdAt": "2025-07-08"
  },
  {
    "id": "c6",
    "firstName": "Robert",
    "lastName": "Kim",
    "email": "robert.kim@dataflow.net",
    "phone": "+1 (408) 555-0987",
    "company": "DataFlow Analytics",
    "companyId": "comp6",
    "status": "lead",
    "jobTitle": "Head of Data Science",
    "lastActivity": "2026-01-20",
    "createdAt": "2025-10-12"
  },
  {
    "id": "c7",
    "firstName": "Lisa",
    "lastName": "Thompson",
    "email": "lisa.t@mediaco.com",
    "phone": "+1 (323) 555-0147",
    "company": "MediaCo Entertainment",
    "companyId": "comp7",
    "status": "active",
    "jobTitle": "Marketing Director",
    "lastActivity": "2026-01-21",
    "createdAt": "2025-04-30"
  },
  {
    "id": "c8",
    "firstName": "David",
    "lastName": "Martinez",
    "email": "d.martinez@cloudserve.io",
    "phone": "+1 (206) 555-0258",
    "company": "CloudServe Inc",
    "companyId": "comp8",
    "status": "inactive",
    "jobTitle": "Solutions Architect",
    "lastActivity": "2025-12-05",
    "createdAt": "2025-02-18"
  },
  {
    "id": "c9",
    "firstName": "Jennifer",
    "lastName": "Lee",
    "email": "jlee@retailplus.com",
    "phone": "+1 (469) 555-0369",
    "company": "RetailPlus Corp",
    "companyId": "comp9",
    "status": "active",
    "jobTitle": "Head of Procurement",
    "lastActivity": "2026-01-26",
    "createdAt": "2025-05-14"
  },
  {
    "id": "c10",
    "firstName": "Michael",
    "lastName": "Brown",
    "email": "mbrown@legaledge.law",
    "phone": "+1 (202) 555-0741",
    "company": "LegalEdge Partners",
    "companyId": "comp10",
    "status": "lead",
    "jobTitle": "Managing Partner",
    "lastActivity": "2026-01-19",
    "createdAt": "2025-11-22"
  }
];

export const seedCompanies: Company[] = [
  {
    "id": "comp-001",
    "name": "Acme Corporation",
    "industry": "Technology",
    "size": "500+",
    "website": "https://acme.example.com",
    "address": "123 Innovation Drive, San Francisco, CA 94105",
    "parentId": null,
    "contactCount": 15,
    "totalDealValue": 450000,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "comp-002",
    "name": "Acme Labs",
    "industry": "Technology",
    "size": "50-100",
    "website": "https://labs.acme.example.com",
    "address": "125 Innovation Drive, San Francisco, CA 94105",
    "parentId": "comp-001",
    "contactCount": 5,
    "totalDealValue": 75000,
    "createdAt": "2024-02-10T14:30:00Z"
  },
  {
    "id": "comp-003",
    "name": "Global Finance Partners",
    "industry": "Finance",
    "size": "100-500",
    "website": "https://globalfinance.example.com",
    "address": "500 Wall Street, New York, NY 10005",
    "parentId": null,
    "contactCount": 8,
    "totalDealValue": 320000,
    "createdAt": "2024-01-20T09:15:00Z"
  },
  {
    "id": "comp-004",
    "name": "HealthFirst Medical",
    "industry": "Healthcare",
    "size": "500+",
    "website": "https://healthfirst.example.com",
    "address": "200 Medical Center Blvd, Boston, MA 02115",
    "parentId": null,
    "contactCount": 12,
    "totalDealValue": 580000,
    "createdAt": "2024-02-01T11:00:00Z"
  },
  {
    "id": "comp-005",
    "name": "HealthFirst Labs",
    "industry": "Healthcare",
    "size": "10-50",
    "website": "https://labs.healthfirst.example.com",
    "address": "202 Medical Center Blvd, Boston, MA 02115",
    "parentId": "comp-004",
    "contactCount": 3,
    "totalDealValue": 45000,
    "createdAt": "2024-03-05T16:45:00Z"
  },
  {
    "id": "comp-006",
    "name": "Precision Manufacturing Inc",
    "industry": "Manufacturing",
    "size": "100-500",
    "website": "https://precisionmfg.example.com",
    "address": "800 Industrial Parkway, Detroit, MI 48201",
    "parentId": null,
    "contactCount": 6,
    "totalDealValue": 210000,
    "createdAt": "2024-01-28T08:30:00Z"
  },
  {
    "id": "comp-007",
    "name": "Retail Solutions Group",
    "industry": "Retail",
    "size": "50-100",
    "website": "https://retailsolutions.example.com",
    "address": "1200 Commerce Street, Chicago, IL 60601",
    "parentId": null,
    "contactCount": 9,
    "totalDealValue": 165000,
    "createdAt": "2024-02-15T13:00:00Z"
  },
  {
    "id": "comp-008",
    "name": "EduTech Learning",
    "industry": "Education",
    "size": "10-50",
    "website": "https://edutech.example.com",
    "address": "50 Campus Drive, Austin, TX 78701",
    "parentId": null,
    "contactCount": 4,
    "totalDealValue": 85000,
    "createdAt": "2024-03-01T10:30:00Z"
  }
];

export const seedDeals: Deal[] = [
  {
    "id": "deal-001",
    "name": "Enterprise CRM Implementation",
    "companyId": "comp-001",
    "companyName": "Acme Corporation",
    "contactId": "cont-001",
    "contactName": "John Smith",
    "value": 125000,
    "stage": "negotiation",
    "probability": 75,
    "expectedCloseDate": "2026-02-15",
    "createdAt": "2025-11-10",
    "stageHistory": [
      { "stage": "lead", "date": "2025-11-10" },
      { "stage": "qualified", "date": "2025-11-18" },
      { "stage": "proposal", "date": "2025-12-05" },
      { "stage": "negotiation", "date": "2026-01-08" }
    ]
  },
  {
    "id": "deal-002",
    "name": "Cloud Migration Project",
    "companyId": "comp-002",
    "companyName": "TechStart Inc",
    "contactId": "cont-002",
    "contactName": "Sarah Johnson",
    "value": 85000,
    "stage": "proposal",
    "probability": 50,
    "expectedCloseDate": "2026-03-01",
    "createdAt": "2025-12-01",
    "stageHistory": [
      { "stage": "lead", "date": "2025-12-01" },
      { "stage": "qualified", "date": "2025-12-15" },
      { "stage": "proposal", "date": "2026-01-05" }
    ]
  },
  {
    "id": "deal-003",
    "name": "Annual Support Contract",
    "companyId": "comp-003",
    "companyName": "Global Industries",
    "contactId": "cont-003",
    "contactName": "Michael Chen",
    "value": 45000,
    "stage": "closed-won",
    "probability": 100,
    "expectedCloseDate": "2026-01-10",
    "createdAt": "2025-10-20",
    "stageHistory": [
      { "stage": "lead", "date": "2025-10-20" },
      { "stage": "qualified", "date": "2025-11-01" },
      { "stage": "proposal", "date": "2025-11-15" },
      { "stage": "negotiation", "date": "2025-12-10" },
      { "stage": "closed-won", "date": "2026-01-10" }
    ]
  },
  {
    "id": "deal-004",
    "name": "Marketing Automation Suite",
    "companyId": "comp-004",
    "companyName": "Creative Solutions Ltd",
    "contactId": "cont-004",
    "contactName": "Emily Davis",
    "value": 67500,
    "stage": "qualified",
    "probability": 30,
    "expectedCloseDate": "2026-04-15",
    "createdAt": "2026-01-05",
    "stageHistory": [
      { "stage": "lead", "date": "2026-01-05" },
      { "stage": "qualified", "date": "2026-01-20" }
    ]
  },
  {
    "id": "deal-005",
    "name": "Data Analytics Platform",
    "companyId": "comp-005",
    "companyName": "DataDriven Co",
    "contactId": "cont-005",
    "contactName": "Robert Wilson",
    "value": 150000,
    "stage": "lead",
    "probability": 10,
    "expectedCloseDate": "2026-06-01",
    "createdAt": "2026-01-15",
    "stageHistory": [
      { "stage": "lead", "date": "2026-01-15" }
    ]
  },
  {
    "id": "deal-006",
    "name": "Security Audit Services",
    "companyId": "comp-006",
    "companyName": "SecureNet Systems",
    "contactId": "cont-006",
    "contactName": "Amanda Martinez",
    "value": 32000,
    "stage": "closed-lost",
    "probability": 0,
    "expectedCloseDate": "2026-01-05",
    "createdAt": "2025-09-15",
    "stageHistory": [
      { "stage": "lead", "date": "2025-09-15" },
      { "stage": "qualified", "date": "2025-10-01" },
      { "stage": "proposal", "date": "2025-11-10" },
      { "stage": "closed-lost", "date": "2026-01-05" }
    ]
  },
  {
    "id": "deal-007",
    "name": "HR Management System",
    "companyId": "comp-007",
    "companyName": "PeopleFirst HR",
    "contactId": "cont-007",
    "contactName": "David Brown",
    "value": 95000,
    "stage": "negotiation",
    "probability": 80,
    "expectedCloseDate": "2026-02-28",
    "createdAt": "2025-10-05",
    "stageHistory": [
      { "stage": "lead", "date": "2025-10-05" },
      { "stage": "qualified", "date": "2025-10-25" },
      { "stage": "proposal", "date": "2025-11-20" },
      { "stage": "negotiation", "date": "2026-01-02" }
    ]
  },
  {
    "id": "deal-008",
    "name": "E-commerce Platform Upgrade",
    "companyId": "comp-008",
    "companyName": "ShopSmart Online",
    "contactId": "cont-008",
    "contactName": "Lisa Anderson",
    "value": 78000,
    "stage": "proposal",
    "probability": 45,
    "expectedCloseDate": "2026-03-15",
    "createdAt": "2025-12-10",
    "stageHistory": [
      { "stage": "lead", "date": "2025-12-10" },
      { "stage": "qualified", "date": "2025-12-28" },
      { "stage": "proposal", "date": "2026-01-12" }
    ]
  }
];

export const seedActivities: Activity[] = [
  {
    "id": "act-001",
    "type": "Call",
    "subject": "Discovery call with Sarah Chen",
    "notes": "Discussed their current CRM pain points and requirements. Very interested in our enterprise solution.",
    "relatedTo": "Sarah Chen",
    "relatedType": "Contact",
    "relatedId": "c1",
    "dueDate": "2026-01-26",
    "completedDate": null,
    "status": "Pending",
    "assignedTo": "John Smith",
    "createdAt": "2026-01-24"
  },
  {
    "id": "act-002",
    "type": "Email",
    "subject": "Send proposal to Acme Corporation",
    "notes": "Include pricing for enterprise tier and implementation timeline.",
    "relatedTo": "Acme Corporation",
    "relatedType": "Company",
    "relatedId": "comp-001",
    "dueDate": "2026-01-25",
    "completedDate": "2026-01-25",
    "status": "Completed",
    "assignedTo": "John Smith",
    "createdAt": "2026-01-23"
  },
  {
    "id": "act-003",
    "type": "Meeting",
    "subject": "Product demo with TechStart Inc",
    "notes": "Demo the cloud migration features. Marcus will join with his team.",
    "relatedTo": "Cloud Migration Project",
    "relatedType": "Deal",
    "relatedId": "deal-002",
    "dueDate": "2026-01-27",
    "completedDate": null,
    "status": "Pending",
    "assignedTo": "Sarah Johnson",
    "createdAt": "2026-01-22"
  },
  {
    "id": "act-004",
    "type": "Task",
    "subject": "Prepare contract for Annual Support renewal",
    "notes": "Standard terms, 10% discount for early renewal.",
    "relatedTo": "Annual Support Contract",
    "relatedType": "Deal",
    "relatedId": "deal-003",
    "dueDate": "2026-01-20",
    "completedDate": "2026-01-19",
    "status": "Completed",
    "assignedTo": "Emily Davis",
    "createdAt": "2026-01-15"
  },
  {
    "id": "act-005",
    "type": "Call",
    "subject": "Follow-up call with Marcus Johnson",
    "notes": "Discuss next steps after the proposal review.",
    "relatedTo": "Marcus Johnson",
    "relatedType": "Contact",
    "relatedId": "c2",
    "dueDate": "2026-01-22",
    "completedDate": null,
    "status": "Overdue",
    "assignedTo": "John Smith",
    "createdAt": "2026-01-18"
  },
  {
    "id": "act-006",
    "type": "Email",
    "subject": "Send case studies to Global Finance",
    "notes": "They requested financial services industry case studies.",
    "relatedTo": "Global Finance Partners",
    "relatedType": "Company",
    "relatedId": "comp-003",
    "dueDate": "2026-01-26",
    "completedDate": null,
    "status": "Pending",
    "assignedTo": "Sarah Johnson",
    "createdAt": "2026-01-24"
  },
  {
    "id": "act-007",
    "type": "Meeting",
    "subject": "Quarterly business review with HealthFirst",
    "notes": "Review Q4 results and discuss Q1 expansion plans.",
    "relatedTo": "HealthFirst Medical",
    "relatedType": "Company",
    "relatedId": "comp-004",
    "dueDate": "2026-01-28",
    "completedDate": null,
    "status": "Pending",
    "assignedTo": "Emily Davis",
    "createdAt": "2026-01-20"
  },
  {
    "id": "act-008",
    "type": "Task",
    "subject": "Update CRM with meeting notes",
    "notes": "Add notes from all client meetings this week.",
    "relatedTo": "Emily Rodriguez",
    "relatedType": "Contact",
    "relatedId": "c3",
    "dueDate": "2026-01-24",
    "completedDate": "2026-01-24",
    "status": "Completed",
    "assignedTo": "John Smith",
    "createdAt": "2026-01-22"
  }
];

export const seedSettings: Settings = {
  "profile": {
    "id": "user-001",
    "name": "Udara Wijesinghe",
    "email": "udara@example.com",
    "avatar": null,
    "timezone": "Europe/London",
    "role": "admin"
  },
  "pipelineStages": [
    { "id": "stage-1", "name": "Lead", "probability": 10, "color": "#6B7280", "order": 1 },
    { "id": "stage-2", "name": "Qualified", "probability": 25, "color": "#3B82F6", "order": 2 },
    { "id": "stage-3", "name": "Proposal", "probability": 50, "color": "#8B5CF6", "order": 3 },
    { "id": "stage-4", "name": "Negotiation", "probability": 75, "color": "#F59E0B", "order": 4 },
    { "id": "stage-5", "name": "Closed Won", "probability": 100, "color": "#10B981", "order": 5 },
    { "id": "stage-6", "name": "Closed Lost", "probability": 0, "color": "#EF4444", "order": 6 }
  ],
  "customFields": [
    { "id": "cf-1", "name": "Lead Source", "type": "dropdown", "entity": "contact", "required": false, "options": ["Website", "Referral", "Social Media", "Cold Call", "Trade Show", "Other"] },
    { "id": "cf-2", "name": "Annual Revenue", "type": "number", "entity": "company", "required": false },
    { "id": "cf-3", "name": "Contract End Date", "type": "date", "entity": "deal", "required": true },
    { "id": "cf-4", "name": "Notes", "type": "text", "entity": "contact", "required": false },
    { "id": "cf-5", "name": "Industry Vertical", "type": "dropdown", "entity": "company", "required": true, "options": ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Other"] }
  ],
  "notifications": {
    "email": {
      "newDeal": true,
      "dealStageChange": true,
      "dealWon": true,
      "dealLost": false,
      "newContact": false,
      "activityReminder": true,
      "weeklyReport": true
    },
    "inApp": {
      "newDeal": true,
      "dealStageChange": true,
      "dealWon": true,
      "dealLost": true,
      "newContact": true,
      "activityReminder": true,
      "mentionNotification": true
    }
  },
  "timezones": [
    { "value": "America/New_York", "label": "Eastern Time (US)" },
    { "value": "America/Chicago", "label": "Central Time (US)" },
    { "value": "America/Denver", "label": "Mountain Time (US)" },
    { "value": "America/Los_Angeles", "label": "Pacific Time (US)" },
    { "value": "Europe/London", "label": "London (UK)" },
    { "value": "Europe/Paris", "label": "Central European Time" },
    { "value": "Asia/Dubai", "label": "Dubai (UAE)" },
    { "value": "Asia/Kolkata", "label": "India Standard Time" },
    { "value": "Asia/Singapore", "label": "Singapore Time" },
    { "value": "Asia/Tokyo", "label": "Japan Standard Time" },
    { "value": "Australia/Sydney", "label": "Sydney (Australia)" }
  ]
};
