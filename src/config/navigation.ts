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
  ArrowRightLeft,
  Factory,
  Store,
  UserCheck,
  Layers,
  Landmark,
  ChefHat,
  Truck,
  TrendingUp,
  PackageCheck,
  CreditCard,
  Undo2,
  Clock,
  User,
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

const ALL_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];
const ADMIN_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];
const SUPER_ONLY = ["SUPER_ADMIN"];
const FRANCHISE_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];

export const SUPER_ADMIN_SIDEBAR: MenuSection[] = [
  // 1. Overview
  {
    title: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 2. Procurement
  {
    title: "Procurement",
    items: [
      {
        icon: Store,
        label: "Vendors",
        href: "/vendors",
        roles: ADMIN_ROLES,
      },
      {
        icon: ShoppingCart,
        label: "Purchase",
        href: "/purchases/orders",
        roles: ADMIN_ROLES,
        children: [
          { label: "Purchase Order", href: "/purchases/orders" },
          { label: "Purchase Inward", href: "/purchases/inward" },
          { label: "Purchase Return", href: "/purchases/returns" },
          { label: "GRN", href: "/purchases/grn" },
        ]
      },
    ],
  },

  // 3. Inventory
  {
    title: "Inventory",
    items: [
      {
        icon: Package,
        label: "Products",
        href: "/products",
        roles: ADMIN_ROLES,
      },
      {
        icon: Layers,
        label: "Inventory Stock",
        href: "/inventory/stock",
        roles: FRANCHISE_ROLES,
      },
      {
        icon: PackageCheck,
        label: "Product Batches",
        href: "/production/batches",
        roles: FRANCHISE_ROLES,
      },
    ],
  },

  // 4. Sales
  {
    title: "Sales",
    items: [
      {
        icon: FileText,
        label: "Sales Invoice",
        href: "/pos",
        roles: ALL_ROLES,
        children: [
          { label: "New Invoice", href: "/pos" },
          { label: "Settlement", href: "/pos/settlement" },
          { label: "Cheque Settle", href: "/pos/cheque-settle" },
          { label: "Sales Return", href: "/sales/returns" },
        ]
      },
      {
        icon: ShoppingCart,
        label: "B2B Orders",
        href: "/sales/orders",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 5. Franchise Master
  {
    title: "Franchise Master",
    items: [
      {
        icon: Building2,
        label: "Manage Franchises",
        href: "/franchise",
        roles: SUPER_ONLY,
      },
      {
        icon: Users,
        label: "Business Partners",
        href: "/franchise/dealers",
        roles: SUPER_ONLY,
        children: [
          { label: "Dealers", href: "/franchise/dealers" },
          { label: "Retailers", href: "/franchise/retailers" },
          { label: "Customers", href: "/customers" },
        ]
      },
      {
        icon: Send,
        label: "Franchise Orders",
        href: "/franchise-orders",
        roles: SUPER_ONLY,
      },
    ],
  },

  // 6. Accounting
  {
    title: "Accounting",
    items: [
      {
        icon: Landmark,
        label: "Business Accounts",
        href: "/banking/accounts",
        roles: ADMIN_ROLES,
      },
      {
        icon: CreditCard,
        label: "Payments",
        href: "/accounting/payments",
        roles: ADMIN_ROLES,
      },
      {
        icon: TrendingUp,
        label: "Expense",
        href: "/accounting/expenses",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Cheque Registry",
        href: "/accounting/cheques",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 7. System Settings
  {
    title: "System",
    items: [
      {
        icon: UserCheck,
        label: "User Creation",
        href: "/admin/users",
        roles: SUPER_ONLY,
      },
      {
        icon: Settings,
        label: "General Settings",
        href: "/settings/user/profile",
        roles: SUPER_ONLY,
      },
      {
        icon: ClipboardList,
        label: "Audit Logs",
        href: "/audit/logs",
        roles: SUPER_ONLY,
      },
    ],
  },
];

export const menuItems = SUPER_ADMIN_SIDEBAR.flatMap((s) => s.items);

// ─── FRANCHISE_ADMIN dedicated sidebar ────────────────────────────────────────
export const franchiseMenuSections: MenuSection[] = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/franchise/dashboard",
        roles: ADMIN_ROLES,
      },
      {
        icon: BarChart3,
        label: "Analytics",
        href: "/reports",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "SALES",
    items: [
      {
        icon: Send,
        label: "Sales Request",
        href: "/franchise-orders",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Sales Invoice",
        href: "/pos",
        roles: ADMIN_ROLES,
        children: [
          { label: "New Invoice", href: "/pos" },
          { label: "Settlement", href: "/pos/settlement" },
          { label: "Cheque Settle", href: "/pos/cheque-settle" },
        ]
      },
      {
        icon: Undo2,
        label: "Sales Returns",
        href: "/sales/returns",
        roles: ADMIN_ROLES,
      },
      {
        icon: TrendingUp,
        label: "Outstanding",
        href: "/accounting/ledgers",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "PURCHASE",
    items: [
      {
        icon: ShoppingCart,
        label: "Purchase Orders",
        href: "/purchases/orders",
        roles: ADMIN_ROLES,
      },
      {
        icon: PackageCheck,
        label: "Stock Entry",
        href: "/purchases/inward",
        roles: ADMIN_ROLES,
      },
      {
        icon: Store,
        label: "Vendors",
        href: "/vendors",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      {
        icon: Package,
        label: "Inventory",
        href: "/franchise/stock",
        roles: ADMIN_ROLES,
      },
      {
        icon: AlertTriangle,
        label: "Low Stock",
        href: "/alerts",
        roles: ADMIN_ROLES,
      },
      {
        icon: Clock,
        label: "Expiry Tracking",
        href: "/production/batches",
        roles: ADMIN_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Stock Transfer",
        href: "/inventory/movements",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "PAYMENTS",
    items: [
      {
        icon: FileText,
        label: "Cheque Management",
        href: "/accounting/cheques",
        roles: ADMIN_ROLES,
      },
      {
        icon: CreditCard,
        label: "Collections",
        href: "/accounting/payments",
        roles: ADMIN_ROLES,
      },
      {
        icon: Landmark,
        label: "Ledger",
        href: "/franchise/payments",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "BUSINESS PARTNERS",
    items: [
      {
        icon: Users,
        label: "Dealers",
        href: "/franchise/dealers",
        roles: ADMIN_ROLES,
      },
      {
        icon: Store,
        label: "Retailers",
        href: "/franchise/retailers",
        roles: ADMIN_ROLES,
      },
      {
        icon: User,
        label: "Customers",
        href: "/customers",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        icon: Settings,
        label: "Profile",
        href: "/profile",
        roles: ADMIN_ROLES,
      },
      {
        icon: Settings,
        label: "Franchise Settings",
        href: "/settings/user/profile",
        roles: ADMIN_ROLES,
      },
    ],
  },
];
