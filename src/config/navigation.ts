import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  BarChart3,
  FileText,
  Settings,
  ClipboardList,
  Building2,
  Send,
  Factory,
  Store,
  UserCheck,
  Layers,
  Landmark,
  Truck,
  TrendingUp,
  PackageCheck,
  CreditCard,
  Undo2,
  Clock,
  User,
  Calculator,
  Receipt,
  FileClock,
} from "lucide-react";

export interface MenuItem {
  icon: any;
  label: string;
  href: string;
  roles: string[];
  isNew?: boolean;
  isHot?: boolean;
  isComingSoon?: boolean;
  children?: {
    label: string;
    href: string;
    isNew?: boolean;
  }[];
}

export interface MenuSection {
  title: string;
  emoji?: string;
  items: MenuItem[];
}

const SUPER_ONLY = ["SUPER_ADMIN"];
const FRANCHISE_ONLY = ["FRANCHISE_ADMIN"];
const ALL_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];

// ─── SUPER_ADMIN (HQ CONTROL CENTER) ──────────────────────────────────────────
export const SUPER_ADMIN_SIDEBAR: MenuSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/",
        roles: SUPER_ONLY,
      },
      {
        icon: BarChart3,
        label: "System Analytics",
        href: "/reports",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "MANUFACTURING",
    items: [
      {
        icon: Factory,
        label: "Production",
        href: "/production",
        roles: SUPER_ONLY,
      },
      {
        icon: Factory,
        label: "Production Batches",
        href: "/production/batches",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "RECIPE MANAGEMENT",
    items: [
      {
        icon: Layers,
        label: "Recipes",
        href: "/production/recipes",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "SALES",
    items: [
      {
        icon: Calculator,
        label: "Estimation",
        href: "/sales/estimation",
        roles: SUPER_ONLY,
        isNew: true,
      },
      {
        icon: Receipt,
        label: "Invoices",
        href: "/sales/invoices",
        roles: SUPER_ONLY,
        isNew: true,
      },
      {
        icon: FileClock,
        label: "Delivery Challan",
        href: "/sales/delivery-challan",
        roles: SUPER_ONLY,
        isNew: true,
      },
    ],
  },
  {
    title: "PROCUREMENT",
    items: [
      {
        icon: Store,
        label: "Vendors",
        href: "/vendors",
        roles: SUPER_ONLY,
      },
      {
        icon: ShoppingCart,
        label: "Purchase Orders",
        href: "/purchases/orders",
        roles: SUPER_ONLY,
        children: [
          { label: "View All Orders", href: "/purchases/orders" },
          { label: "Create New PO", href: "/purchases/new" },
        ]
      },
      {
        icon: Truck,
        label: "Purchase Inward (GRN)",
        href: "/purchases/inward",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        icon: Package,
        label: "Global Products",
        href: "/products",
        roles: SUPER_ONLY,
      },
      {
        icon: Building2,
        label: "Warehouses Hub",
        href: "/inventory/warehouses",
        roles: SUPER_ONLY,
        // isNew: true,
      },
      {
        icon: Landmark,
        label: "Central Warehouse",
        href: "/inventory/stock",
        roles: SUPER_ONLY,
      },
      {
        icon: Clock,
        label: "Expiry Tracking",
        href: "/production/batches",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        icon: Landmark,
        label: "Business Accounts",
        href: "/banking/accounts",
        roles: SUPER_ONLY,
      },
      {
        icon: CreditCard,
        label: "Direct Payments",
        href: "/accounting/payments",
        roles: SUPER_ONLY,
      },
      {
        icon: TrendingUp,
        label: "HQ Expenses",
        href: "/accounting/expenses",
        roles: SUPER_ONLY,
      },
      {
        icon: FileText,
        label: "Cheque Registry",
        href: "/accounting/cheques",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "FRANCHISE MANAGEMENT",
    items: [
      {
        icon: Building2,
        label: "Manage Branches",
        href: "/franchise",
        roles: SUPER_ONLY,
      },
      {
        icon: Send,
        label: "Branch Orders",
        href: "/franchise-orders",
        roles: SUPER_ONLY,
      },
      {
        icon: Users,
        label: "Branch Settlement",
        href: "/accounting/ledgers",
        roles: SUPER_ONLY,
      },
      {
        icon: Users,
        label: "Dealers Oversight",
        href: "/franchise/dealers",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "POS",
    items: [
      {
        icon: ShoppingCart,
        label: "HQ POS",
        href: "/pos",
        roles: SUPER_ONLY,
      },
      {
        icon: FileText,
        label: "EOD Settlement",
        href: "/pos/settlement",
        roles: SUPER_ONLY,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        icon: UserCheck,
        label: "User Governance",
        href: "/admin/users",
        roles: SUPER_ONLY,
      },
      {
        icon: ClipboardList,
        label: "Audit Logs",
        href: "/audit/logs",
        roles: SUPER_ONLY,
      },
      {
        icon: Settings,
        label: "Global Settings",
        href: "/settings/user/profile",
        roles: SUPER_ONLY,
      },
    ],
  },
];

// ─── FRANCHISE_ADMIN (BRANCH OPERATOR) ────────────────────────────────────────
export const franchiseMenuSections: MenuSection[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: LayoutDashboard,
        label: "Branch Dashboard",
        href: "/franchise/dashboard",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: BarChart3,
        label: "Branch Reports",
        href: "/reports",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "POS",
    items: [
      {
        icon: ShoppingCart,
        label: "New Invoice",
        href: "/pos",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: FileText,
        label: "Settlement",
        href: "/pos/settlement",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        icon: Package,
        label: "Product Inventory",
        href: "/franchise/stock",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: AlertTriangle,
        label: "Low Stock Alerts",
        href: "/alerts",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: Clock,
        label: "Expiry Tracking",
        href: "/production/batches",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "STOCK PROCUREMENT",
    items: [
      {
        icon: Send,
        label: "Product Orders",
        href: "/franchise-orders",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: PackageCheck,
        label: "Incoming Stock",
        href: "/purchases/inward",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: Landmark,
        label: "Supplier Ledger (HQ)",
        href: "/franchise/supplier-ledger",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        icon: Landmark,
        label: "Business Accounts",
        href: "/banking/accounts",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: CreditCard,
        label: "Collections",
        href: "/accounting/payments",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: TrendingUp,
        label: "Outstanding",
        href: "/accounting/ledgers",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: FileText,
        label: "Cheque Management",
        href: "/accounting/cheques",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "PARTNERS",
    items: [
      {
        icon: Users,
        label: "Dealers",
        href: "/franchise/dealers",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: User,
        label: "Customers",
        href: "/customers",
        roles: FRANCHISE_ONLY,
      },
      {
        icon: Undo2,
        label: "Returns",
        href: "/sales/returns",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        icon: Settings,
        label: "Branch Profile",
        href: "/profile/agency",
        roles: FRANCHISE_ONLY,
      },
    ],
  },
];

export const menuItems = [
  ...SUPER_ADMIN_SIDEBAR.flatMap(s => s.items),
  ...franchiseMenuSections.flatMap(s => s.items)
];
