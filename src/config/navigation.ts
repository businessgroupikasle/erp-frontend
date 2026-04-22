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
  Activity,
  UserCheck,
  Layers,
  Clock,
  Landmark,
  ChefHat,
  Truck,
  TrendingUp,
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

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "FRANCHISEE"];
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
const SUPER_ONLY = ["SUPER_ADMIN"];

export const menuSections: MenuSection[] = [
  {
    section: "Overview",
    emoji: "📊",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    section: "Home House",
    emoji: "🏭",
    items: [
      {
        icon: Store,
        label: "Vendor Management",
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
        icon: Layers,
        label: "Raw Material Stock",
        href: "/inventory/stock",
        roles: ALL_ROLES,
      },
      {
        icon: ChefHat,
        label: "Recipe Management",
        href: "/recipes",
        roles: ADMIN_ROLES,
      },
      {
        icon: Factory,
        label: "Production",
        href: "/production",
        roles: ADMIN_ROLES,
      },
      {
        icon: Package,
        label: "Products",
        href: "/products",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    section: "Franchise",
    emoji: "🏪",
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
        label: "Product Requests",
        href: "/franchise/requests",
        roles: ALL_ROLES,
      },
      {
        icon: ArrowRightLeft,
        label: "Stock Transfers",
        href: "/franchise/transfers",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    section: "Sales Module",
    emoji: "💰",
    items: [
      {
        icon: ShoppingCart,
        label: "POS & Invoicing",
        href: "/pos",
        roles: ALL_ROLES,
      },
      {
        icon: FileText,
        label: "Sales Orders",
        href: "/sales/orders",
        roles: ALL_ROLES,
      },
      {
        icon: Users,
        label: "Customers",
        href: "/customers",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    section: "Purchase Module",
    emoji: "🛒",
    items: [
      {
        icon: FlaskConical,
        label: "Request for Quote",
        href: "/purchases/rfq",
        roles: ADMIN_ROLES,
      },
      {
        icon: Truck,
        label: "Goods Receipt (GRN)",
        href: "/purchase/grn",
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
    section: "Reports",
    emoji: "📈",
    items: [
      {
        icon: BarChart3,
        label: "Sales Reports",
        href: "/reports",
        roles: ADMIN_ROLES,
      },
      {
        icon: TrendingUp,
        label: "Inventory Value",
        href: "/inventory/stock-value",
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
    section: "HR & Payroll",
    emoji: "👥",
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
    section: "System Settings",
    emoji: "⚙️",
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

export const menuItems = menuSections.flatMap((s) => s.items);
