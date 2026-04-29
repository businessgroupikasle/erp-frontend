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

const ALL_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN", "ADMIN", "MANAGER", "STAFF", "FRANCHISEE"];
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
const SUPER_ONLY = ["SUPER_ADMIN"];
const FRANCHISE_ROLES = ["SUPER_ADMIN", "FRANCHISE_ADMIN", "ADMIN", "MANAGER"];

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

  // 2. Procurement — buy raw materials first
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
        label: "Purchase Orders",
        href: "/purchases/orders",
        roles: ADMIN_ROLES,
      },
      {
        icon: Truck,
        label: "Goods Receipt (GRN)",
        href: "/purchases/grn",
        roles: ADMIN_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Purchase Returns",
        href: "/purchases/returns",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 3. Inventory — stock raw materials & finished goods
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
        icon: TrendingUp,
        label: "Inventory Value",
        href: "/inventory/stock-value",
        roles: ADMIN_ROLES,
      },
      {
        icon: PackageCheck,
        label: "Product Batches",
        href: "/production/batches",
        roles: FRANCHISE_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Stock Movement",
        href: "/inventory/movements",
        roles: ADMIN_ROLES,
        isComingSoon: true,
      },
    ],
  },

  // 4. Production — convert raw materials into finished goods
  {
    title: "Production",
    items: [
      {
        icon: ChefHat,
        label: "Recipes",
        href: "/recipes",
        roles: ADMIN_ROLES,
      },
      {
        icon: Factory,
        label: "Production Batches",
        href: "/production",
        roles: FRANCHISE_ROLES,
      },
    ],
  },

  // 5. Sales — sell to customers
  {
    title: "Sales",
    items: [
      {
        icon: Users,
        label: "Customers",
        href: "/customers",
        roles: ADMIN_ROLES,
      },
      {
        icon: ShoppingCart,
        label: "POS Billing",
        href: "/pos",
        roles: ALL_ROLES,
      },
      {
        icon: FileText,
        label: "Sales Orders",
        href: "/sales/orders",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 6. Franchise — distribute to franchise branches
  {
    title: "Franchise",
    items: [
      {
        icon: LayoutDashboard,
        label: "Franchise Dashboard",
        href: "/franchise/dashboard",
        roles: ADMIN_ROLES,
      },
      {
        icon: Building2,
        label: "Manage Franchises",
        href: "/franchise",
        roles: ADMIN_ROLES,
      },
      {
        icon: Send,
        label: "Franchise Orders",
        href: "/franchise/requests",
        roles: FRANCHISE_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Dispatch & Delivery",
        href: "/franchise/transfers",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 7. Accounts — track money
  {
    title: "Accounts",
    items: [
      {
        icon: CreditCard,
        label: "Payments",
        href: "/accounting/payments",
        roles: ADMIN_ROLES,
      },
      {
        icon: TrendingUp,
        label: "Expenses",
        href: "/accounting/expenses",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Vendor Ledger",
        href: "/accounting/ledgers",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 8. Reports — analyse performance
  {
    title: "Reports",
    items: [
      {
        icon: BarChart3,
        label: "Sales Reports",
        href: "/reports",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Purchase Reports",
        href: "/reports/purchases",
        roles: ADMIN_ROLES,
        isComingSoon: true,
      },
      {
        icon: FileText,
        label: "Inventory Reports",
        href: "/reports/inventory",
        roles: ADMIN_ROLES,
        isComingSoon: true,
      },
      {
        icon: TrendingUp,
        label: "Profit & Loss",
        href: "/accounting/profit-loss",
        roles: ADMIN_ROLES,
      },
      {
        icon: AlertTriangle,
        label: "Alerts",
        href: "/alerts",
        roles: ALL_ROLES,
      },
    ],
  },

  // 9. HR & Payroll
  {
    title: "HR & Payroll",
    items: [
      {
        icon: UserCheck,
        label: "Employee Master",
        href: "/hr/employees",
        roles: ADMIN_ROLES,
      },
      {
        icon: Landmark,
        label: "Payroll & Payslips",
        href: "/hr/payroll",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // 10. System Settings
  {
    title: "System Settings",
    items: [
      {
        icon: Settings,
        label: "General Settings",
        href: "/settings/general",
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
const FRANCHISE_ADMIN_ONLY = ["SUPER_ADMIN", "FRANCHISE_ADMIN", "MANAGER", "FRANCHISEE"];
const FRANCHISE_ALL = ["SUPER_ADMIN", "FRANCHISE_ADMIN", "MANAGER", "FRANCHISEE", "STAFF"];

export const franchiseMenuSections: MenuSection[] = [
  {
    title: "Home",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/franchise/dashboard",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        icon: ShoppingCart,
        label: "My Orders",
        href: "/franchise-orders",
        roles: FRANCHISE_ADMIN_ONLY,
        children: [
          { label: "Place Order", href: "/franchise-orders" },
          { label: "Order History", href: "/franchise-orders" },
        ],
      },
    ],
  },
  {
    title: "Stock",
    items: [
      {
        icon: Package,
        label: "Available Products",
        href: "/franchise/stock",
        roles: FRANCHISE_ADMIN_ONLY,
      },
      {
        icon: PackageCheck,
        label: "Expiry Tracking",
        href: "/production/batches",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        icon: CreditCard,
        label: "Payments & Ledger",
        href: "/franchise/payments",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        icon: ShoppingCart,
        label: "POS Billing",
        href: "/pos",
        roles: FRANCHISE_ALL,
      },
      {
        icon: Users,
        label: "Customers",
        href: "/customers",
        roles: FRANCHISE_ADMIN_ONLY,
      },
      {
        icon: BarChart3,
        label: "Sales Reports",
        href: "/reports",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
  {
    title: "HR & Staff",
    items: [
      {
        icon: UserCheck,
        label: "Employee Master",
        href: "/hr/employees",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        icon: Settings,
        label: "Settings",
        href: "/settings/general",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
];
