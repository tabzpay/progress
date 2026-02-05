export type LoanStatus = "active" | "partial" | "completed" | "overdue";
export type LoanType = "personal" | "business" | "group";

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  lenderId: string;
  lenderName: string;
  amount: number;
  remainingAmount: number;
  dueDate: string;
  createdDate: string;
  status: LoanStatus;
  type: LoanType;
  currency?: string;
  isAccepted: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  payoutDetails?: string;
  notes?: string;
  repayments: Repayment[];
  reminders: Reminder[];
}

export interface Repayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Reminder {
  id: string;
  sentDate: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

// Mock current user
export const currentUser: User = {
  id: "user-1",
  name: "You",
  phone: "+1234567890",
};

// Mock loans
export const mockLoans: Loan[] = [
  {
    id: "loan-1",
    borrowerId: "user-2",
    borrowerName: "Sarah Chen",
    lenderId: "user-1",
    lenderName: "You",
    amount: 500,
    remainingAmount: 500,
    dueDate: "2026-02-20",
    createdDate: "2026-01-15",
    status: "active",
    type: "personal",
    notes: "For laptop repair",
    isAccepted: true,
    bankName: "Bank of America",
    accountName: "John Doe",
    accountNumber: "**** 4532",
    repayments: [],
    reminders: [
      {
        id: "rem-1",
        sentDate: "2026-02-01",
        message: "Friendly reminder about the loan due on Feb 20",
      },
    ],
  },
  {
    id: "loan-2",
    borrowerId: "user-3",
    borrowerName: "Marcus Johnson",
    lenderId: "user-1",
    lenderName: "You",
    amount: 1200,
    remainingAmount: 600,
    dueDate: "2026-02-15",
    createdDate: "2025-12-01",
    status: "partial",
    type: "business",
    notes: "Business inventory purchase",
    isAccepted: true,
    bankName: "Chase Savings",
    accountName: "Akinrodolu Olajide",
    accountNumber: "**** 9901",
    repayments: [
      {
        id: "rep-1",
        amount: 300,
        date: "2026-01-10",
      },
      {
        id: "rep-2",
        amount: 300,
        date: "2026-01-25",
      },
    ],
    reminders: [],
  },
  {
    id: "loan-3",
    borrowerId: "user-1",
    borrowerName: "You",
    lenderId: "user-4",
    lenderName: "Emma Wilson",
    amount: 300,
    remainingAmount: 300,
    dueDate: "2026-02-10",
    createdDate: "2026-01-20",
    status: "active",
    type: "personal",
    isAccepted: true,
    notes: "Concert tickets",
    repayments: [],
    reminders: [],
  },
  {
    id: "loan-4",
    borrowerId: "user-5",
    borrowerName: "David Park",
    lenderId: "user-1",
    lenderName: "You",
    amount: 750,
    remainingAmount: 0,
    dueDate: "2026-01-30",
    createdDate: "2025-12-15",
    status: "completed",
    type: "personal",
    isAccepted: true,
    repayments: [
      {
        id: "rep-3",
        amount: 750,
        date: "2026-01-28",
        note: "Paid in full, thanks!",
      },
    ],
    reminders: [],
  },
  {
    id: "loan-5",
    borrowerId: "user-6",
    borrowerName: "Lisa Rodriguez",
    lenderId: "user-1",
    lenderName: "You",
    amount: 200,
    remainingAmount: 200,
    dueDate: "2026-01-25",
    createdDate: "2025-12-20",
    status: "overdue",
    type: "personal",
    isAccepted: true,
    repayments: [],
    reminders: [
      {
        id: "rem-2",
        sentDate: "2026-01-24",
        message: "Gentle reminder about payment due tomorrow",
      },
      {
        id: "rem-3",
        sentDate: "2026-01-30",
        message: "Following up on the overdue payment",
      },
    ],
  },
];

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  loans: Loan[];
}

export interface GroupMember {
  id: string;
  name: string;
  balance: number;
}

export const mockGroups: Group[] = [
  {
    id: "group-1",
    name: "Study Group",
    members: [
      { id: "user-1", name: "You", balance: -150 },
      { id: "user-7", name: "Alex Kim", balance: 50 },
      { id: "user-8", name: "Jordan Lee", balance: 100 },
    ],
    loans: [],
  },
];

export interface Notification {
  id: string;
  type: "payment" | "notice" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "payment",
    title: "Payment Received",
    message: "Sarah Chen paid $50 towards her laptop repair loan.",
    time: "2h ago",
    read: false,
  },
  {
    id: "notif-2",
    type: "notice",
    title: "Reminder Delivered",
    message: "Your friendly nudge was delivered to Marcus Johnson.",
    time: "5h ago",
    read: true,
  },
  {
    id: "notif-3",
    type: "system",
    title: "Welcome to Progress",
    message: "Start tracking your informal loans with ease and confidence.",
    time: "1d ago",
    read: true,
  },
];
