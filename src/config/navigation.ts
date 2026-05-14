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
        label: "Purchase",
        href: "/purchases/orders",
        roles: ADMIN_ROLES,
        children: [
          { label: "Purchase Order", href: "/purchases/orders" },
          { label: "Purchase Inward", href: "/purchases/inward" },
          { label: "Purchase Return", href: "/purchases/returns" },
          { label: "DC Inward Entry", href: "/purchases/dc-inward" },
          { label: "GRN", href: "/purchases/grn" },
        ]
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
        label: "B2C Billing",
        href: "/pos",
        roles: ALL_ROLES,
        children: [
          { label: "B2C Billing", href: "/pos" },
          { label: "B2C Settlement", href: "/pos/settlement" },
          { label: "Cheque Settle", href: "/pos/cheque-settle" },
        ]
      },
      {
        icon: FileText,
        label: "B2B Billing",
        href: "/sales/orders",
        roles: ADMIN_ROLES,
        children: [
          { label: "B2B Billing", href: "/sales/orders" },
          { label: "B2B Settlement", href: "/sales/settlement" },
          { label: "Cheque Settle", href: "/sales/cheque-settle" },
          { label: "Sales Return", href: "/sales/returns" },
        ]
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

  // 7. Accounting — track money
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
        children: [
          { label: "Expense Master", href: "/accounting/expenses/categories" },
          { label: "Expense Entry", href: "/accounting/expenses/new" },
          { label: "Expense Report", href: "/reports/expenses" },
        ]
      },
      {
        icon: FileText,
        label: "Cheque Registry",
        href: "/accounting/cheques",
        roles: ADMIN_ROLES,
      },
      {
        icon: FileText,
        label: "Supplier Payments",
        href: "/accounting/ledgers",
        roles: ADMIN_ROLES,
        children: [
          { label: "Supplier Pay Track", href: "/accounting/ledgers" },
          { label: "Cheque Settle", href: "/accounting/cheque-settle" },
        ]
      },
    ],
  },

  // 8. Reports — analyse performance
  {
    title: "Reports",
    items: [
      {
        icon: BarChart3,
        label: "Master Reports",
        href: "/reports",
        roles: ADMIN_ROLES,
        children: [
          { label: "B2B Sales Report", href: "/reports/b2b-sales" },
          { label: "B2B Detail Report", href: "/reports/b2b-detail" },
          { label: "B2B Emp wise Sales Report", href: "/reports/b2b-emp-sales" },
          { label: "B2B Emp wise Detail Report", href: "/reports/b2b-emp-detail" },
          { label: "B2C Sales Report", href: "/reports/b2c-sales" },
          { label: "B2C Detail Report", href: "/reports/b2c-detail" },
          { label: "Purchase Report", href: "/reports/purchases" },
          { label: "Product Wise Sales Report", href: "/reports/product-sales" },
          { label: "Collection Report", href: "/reports/collection" },
          { label: "Profit/Loss Report", href: "/accounting/profit-loss" },
          { label: "Ageing Report", href: "/reports/ageing" },
        ]
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
      {
        icon: Landmark,
        label: "Apply Leaves",
        href: "/hr/leaves",
        roles: ADMIN_ROLES,
      },


    ],
  },

  // 10. Setup Management
  {
    title: "Setup Management",
    items: [
      {
        icon: Settings,
        label: "Master Setup",
        href: "/settings/master",
        roles: SUPER_ONLY,
        children: [
          { label: "Company Profile", href: "/settings/user/profile" },
          { label: "Supplier", href: "/vendors" },
          { label: "Customer", href: "/customers" },
          { label: "Product", href: "/products" },
          { label: "Category", href: "/products/categories" },
          { label: "Employee", href: "/hr/employees" },
          { label: "User Creation", href: "/admin/users" },
          { label: "Dealer/Distributor", href: "/dealers" },
          { label: "Bank", href: "/banking/accounts" },
          { label: "Role", href: "/admin/roles" },
          { label: "Region", href: "/settings/regions" },
        ]
      },
    ],
  },

  // 11. System Settings
  {
    title: "System Settings",
    items: [
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
const FRANCHISE_ADMIN_ONLY = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];
const FRANCHISE_ALL = ["SUPER_ADMIN", "FRANCHISE_ADMIN"];

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
        label: "B2C Billing",
        href: "/pos",
        roles: FRANCHISE_ALL,
        children: [
          { label: "B2C Billing", href: "/pos" },
          { label: "B2C Settlement", href: "/pos/settlement" },
          { label: "Cheque Settle", href: "/pos/cheque-settle" },
        ]
      },
      {
        icon: Users,
        label: "Customers",
        href: "/customers",
        roles: FRANCHISE_ADMIN_ONLY,
      },
      {
        icon: Undo2,
        label: "Sales Returns",
        href: "/sales/returns",
        roles: FRANCHISE_ADMIN_ONLY,
      },
      {
        icon: BarChart3,
        label: "Master Reports",
        href: "/reports",
        roles: FRANCHISE_ADMIN_ONLY,
        children: [
          { label: "B2B Sales Report", href: "/reports/b2b-sales" },
          { label: "B2B Detail Report", href: "/reports/b2b-detail" },
          { label: "B2C Sales Report", href: "/reports/b2c-sales" },
          { label: "B2C Detail Report", href: "/reports/b2c-detail" },
          { label: "Collection Report", href: "/reports/collection" },
        ]
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
        href: "/settings/user/profile",
        roles: FRANCHISE_ADMIN_ONLY,
      },
    ],
  },
];
