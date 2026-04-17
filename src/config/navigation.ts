import {
  LayoutDashboard,
  ShoppingCart,
  Tv,
  UtensilsCrossed,
  ChefHat,
  Factory,
  Trash2,
  Package,
  AlertTriangle,
  Users,
  Star,
  BarChart3,
  FileText,
  CreditCard,
  BookOpen,
  Landmark,
  Settings,
  ClipboardList,
  Workflow,
  PlugZap,
  Bell,
} from "lucide-react";

export interface MenuItem {
  icon: any;
  label: string;
  href: string;
  roles: string[];
  isNew?: boolean;
  isHot?: boolean;
  children?: {
    label: string;
    href: string;
    isNew?: boolean;
  }[];
}

export interface MenuSection {
  section: string;
  emoji?: string;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    section: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/",
        roles: ["ADMIN", "MANAGER", "FRANCHISEE"],
      },
    ],
  },
  {
    section: "Food Operations",
    emoji: "🍽️",
    items: [
      {
        icon: ShoppingCart,
        label: "Billing & POS",
        href: "/pos",
        roles: ["ADMIN", "MANAGER", "FRANCHISEE"],
        isHot: true,
      },
      {
        icon: Tv,
        label: "Kitchen Display (KDS)",
        href: "/kds",
        roles: ["ADMIN", "MANAGER", "FRANCHISEE"],
      },
      {
        icon: UtensilsCrossed,
        label: "Menu Management",
        href: "/menu",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
    ],
  },
  {
    section: "Production",
    emoji: "🏭",
    items: [
      {
        icon: ChefHat,
        label: "Recipe Management",
        href: "/recipes",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        icon: Factory,
        label: "Production Batches",
        href: "/production",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
      {
        icon: Trash2,
        label: "Waste & Loss",
        href: "/waste",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
    ],
  },
  {
    section: "Inventory",
    emoji: "📦",
    items: [
      {
        icon: Package,
        label: "Raw Materials",
        href: "#",
        roles: ["ADMIN", "MANAGER", "FRANCHISEE"],
        children: [
          { label: "All Stock Items", href: "/inventory/items" },
          { label: "Stock Value Report", href: "/inventory/stock-value" },
          { label: "Batch & Expiry", href: "/inventory/batch-expiry" },
          { label: "Warehouses", href: "/inventory/warehouses" },
          { label: "All Transactions", href: "/inventory/all-transactions" },
        ],
      },
      {
        icon: AlertTriangle,
        label: "Stock Alerts",
        href: "/alerts",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
    ],
  },
  {
    section: "Customers",
    emoji: "👥",
    items: [
      {
        icon: Users,
        label: "Customer Database",
        href: "/customers",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
      {
        icon: Star,
        label: "Loyalty & Rewards",
        href: "/customers/loyalty",
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
  {
    section: "Finance & Reports",
    emoji: "💰",
    items: [
      {
        icon: BarChart3,
        label: "Sales Reports",
        href: "/reports",
        roles: ["ADMIN", "MANAGER", "FRANCHISEE"],
      },
      {
        icon: FileText,
        label: "GST & Invoices",
        href: "#",
        roles: ["ADMIN"],
        children: [
          { label: "GSTR-1 Sales Report", href: "/gst/gstr-1" },
          { label: "GSTR-2B Purchase Report", href: "/gst/gstr-2b" },
          { label: "GSTR-3B Summary", href: "/gst/gstr-3b" },
          { label: "All Invoices", href: "/sales/invoices" },
        ],
      },
      {
        icon: CreditCard,
        label: "Purchases & Expenses",
        href: "#",
        roles: ["ADMIN", "MANAGER"],
        children: [
          { label: "Vendors & Suppliers", href: "/vendors" },
          { label: "Purchases & Expenses", href: "/purchases" },
          { label: "Purchase Orders", href: "/purchases/orders" },
          { label: "Payout Receipts", href: "/purchases/payout-receipts" },
        ],
      },
      {
        icon: BookOpen,
        label: "Accounting",
        href: "#",
        roles: ["ADMIN"],
        children: [
          { label: "Profit & Loss", href: "/accounting/profit-loss" },
          { label: "Balance Sheet", href: "/accounting/balance-sheet" },
          { label: "Day Book", href: "/accounting/day-book" },
          { label: "All Ledgers", href: "/accounting/ledgers" },
          { label: "Cash Flow", href: "/accounting/cash-flow" },
        ],
      },
      {
        icon: Landmark,
        label: "Banking",
        href: "#",
        roles: ["ADMIN"],
        children: [
          { label: "Payment Accounts", href: "/banking/payment-accounts" },
          { label: "Bank Accounts", href: "/banking/accounts" },
          { label: "Bank Reconciliation", href: "/banking/reconciliation" },
        ],
      },
    ],
  },
  {
    section: "Alerts & Automation",
    emoji: "🔔",
    items: [
      {
        icon: Bell,
        label: "Real-Time Alerts",
        href: "/alerts",
        roles: ["ADMIN", "MANAGER"],
        isNew: true,
      },
      {
        icon: Workflow,
        label: "Workflows",
        href: "/workflows",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    section: "Settings & Team",
    emoji: "⚙️",
    items: [
      {
        icon: ClipboardList,
        label: "Payroll & HRMS",
        href: "/payroll",
        roles: ["ADMIN"],
      },
      {
        icon: Users,
        label: "Manage Team",
        href: "#",
        roles: ["ADMIN"],
        children: [
          { label: "Manage Users", href: "/settings/team" },
          { label: "Manage Roles", href: "/settings/roles" },
        ],
      },
      {
        icon: Settings,
        label: "Business Settings",
        href: "/settings/general",
        roles: ["ADMIN"],
      },
      {
        icon: PlugZap,
        label: "Integrations",
        href: "/settings/integrations",
        roles: ["ADMIN"],
      },
    ],
  },
];

export const menuItems = menuSections.flatMap((s) => s.items);
