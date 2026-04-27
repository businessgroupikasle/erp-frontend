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
  FlaskConical,
  Factory,
  Store,
  UserCheck,
  Layers,
  Clock,
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
  {
    title: "Sales",
    items: [
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
      {
        icon: Users,
        label: "Customers",
        href: "/customers",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        icon: Layers,
        label: "Raw Materials",
        href: "/inventory/stock",
        roles: FRANCHISE_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Stock Movement",
        href: "/inventory/movements",
        roles: ADMIN_ROLES,
        isComingSoon: true,
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
    ],
  },
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
  {
    title: "Accounts",
    items: [
      {
        icon: CreditCard,
        label: "Payments",
        href: "/accounting/vouchers?type=payment",
        roles: ADMIN_ROLES,
      },
      {
        icon: TrendingUp,
        label: "Expenses",
        href: "/accounting/vouchers?type=expense",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Vendor Ledger",
        href: "/accounting/ledgers?type=vendor",
        roles: ADMIN_ROLES,
      },
    ],
  },
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
        icon: Clock,
        label: "Attendance",
        href: "/hr/attendance",
        roles: ALL_ROLES,
      },
      {
        icon: Landmark,
        label: "Payroll & Payslips",
        href: "/hr/payroll",
        roles: ADMIN_ROLES,
      },
    ],
  },
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
const FRANCHISE_ADMIN_ONLY = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];

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
          { label: "Place Order",   href: "/franchise-orders" },
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
        icon: BarChart3,
        label: "Sales Reports",
        href: "/reports",
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
