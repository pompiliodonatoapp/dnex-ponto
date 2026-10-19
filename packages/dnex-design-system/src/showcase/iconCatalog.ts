import type { LucideIcon } from "lucide-react";
import {
  // navegação
  LayoutDashboard,
  Home,
  Compass,
  Menu,
  Search,
  Settings,
  Bell,
  User,
  Users,
  Building2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  // finanças / fiscal
  Wallet,
  Receipt,
  Landmark,
  Coins,
  CreditCard,
  PiggyBank,
  Calculator,
  FileText,
  FileCheck,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Percent,
  // ações
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Copy,
  Share2,
  Filter,
  RefreshCw,
  Save,
  Send,
  // status / feedback
  Check,
  CheckCheck,
  X,
  Info,
  AlertTriangle,
  CircleAlert,
  XCircle,
  Clock,
  CalendarDays,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * Catálogo CURADO de ícones do ecossistema DNEX.
 * -----------------------------------------------------------------------------
 * lucide-react é a biblioteca oficial de ícones do DS. Em vez de expor os ~1500
 * ícones da lib, curamos aqui o subconjunto que cobre o produto contábil-fiscal
 * (navegação, finanças/fiscal, ações, status). É a "paleta de ícones" da marca —
 * o time escolhe daqui antes de buscar fora.
 *
 * Diretriz de uso (ver README):
 *   - tamanhos canônicos: 16 / 20 / 24 px (className h-4/h-5/h-6);
 *   - stroke ~2 (padrão da lucide) — não engrossar;
 *   - cor herda `currentColor` — nunca cor fixa; tinge via text-* do tema.
 */

export type IconEntry = { name: string; Icon: LucideIcon };
export type IconGroup = { id: string; label: string; icons: IconEntry[] };

const e = (name: string, Icon: LucideIcon): IconEntry => ({ name, Icon });

export const iconGroups: IconGroup[] = [
  {
    id: "navegacao",
    label: "Navegação",
    icons: [
      e("LayoutDashboard", LayoutDashboard),
      e("Home", Home),
      e("Compass", Compass),
      e("Menu", Menu),
      e("Search", Search),
      e("Settings", Settings),
      e("Bell", Bell),
      e("User", User),
      e("Users", Users),
      e("Building2", Building2),
      e("ChevronRight", ChevronRight),
      e("ArrowRight", ArrowRight),
      e("ArrowLeft", ArrowLeft),
      e("ExternalLink", ExternalLink),
    ],
  },
  {
    id: "financas",
    label: "Finanças / Fiscal",
    icons: [
      e("Wallet", Wallet),
      e("Receipt", Receipt),
      e("Landmark", Landmark),
      e("Coins", Coins),
      e("CreditCard", CreditCard),
      e("PiggyBank", PiggyBank),
      e("Calculator", Calculator),
      e("FileText", FileText),
      e("FileCheck", FileCheck),
      e("TrendingUp", TrendingUp),
      e("TrendingDown", TrendingDown),
      e("BarChart3", BarChart3),
      e("PieChart", PieChart),
      e("Percent", Percent),
    ],
  },
  {
    id: "acoes",
    label: "Ações",
    icons: [
      e("Plus", Plus),
      e("Pencil", Pencil),
      e("Trash2", Trash2),
      e("Download", Download),
      e("Upload", Upload),
      e("Copy", Copy),
      e("Share2", Share2),
      e("Filter", Filter),
      e("RefreshCw", RefreshCw),
      e("Save", Save),
      e("Send", Send),
    ],
  },
  {
    id: "status",
    label: "Status / Feedback",
    icons: [
      e("Check", Check),
      e("CheckCheck", CheckCheck),
      e("X", X),
      e("Info", Info),
      e("AlertTriangle", AlertTriangle),
      e("CircleAlert", CircleAlert),
      e("XCircle", XCircle),
      e("Clock", Clock),
      e("CalendarDays", CalendarDays),
      e("Loader2", Loader2),
      e("Lock", Lock),
      e("ShieldCheck", ShieldCheck),
      e("Sparkles", Sparkles),
      e("Eye", Eye),
      e("EyeOff", EyeOff),
    ],
  },
];

export const allIcons: IconEntry[] = iconGroups.flatMap((g) => g.icons);
