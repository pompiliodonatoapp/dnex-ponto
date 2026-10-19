/**
 * @dnex/ds — ponto de entrada público do DNEX Design System.
 * Apps consomem tudo daqui: `import { Button, StatCard, useTheme } from "@dnex/ds"`.
 * O CSS de tokens deve ser importado uma vez no app: `import "@dnex/ds/styles"`.
 */

/* ---------- Foundations ---------- */
export {
  tokens,
  color,
  semantic,
  font,
  fontSize,
  typeScale,
  space,
  radius,
  shadow,
  motion,
  appShell,
  pageHeader,
  zIndex,
  zIndexScale,
  elevation,
  elevationScale,
  breakpoints,
  breakpointScale,
  duration,
  easing,
  motionScale,
  easingScale,
} from "./tokens/tokens";
export type {
  Tokens,
  TypeScaleEntry,
  ZIndexEntry,
  ElevationEntry,
  BreakpointEntry,
  MotionDurationEntry,
  MotionEasingEntry,
} from "./tokens/tokens";
export { cn } from "./lib/cn";
export { ThemeProvider, useTheme } from "./lib/theme";
export type { Theme, ResolvedTheme } from "./lib/theme";
export { DensityProvider, useDensity } from "./lib/density";
export type { Density } from "./lib/density";
export {
  easeSoft,
  fadeUp,
  fadeScale,
  staggerContainer,
  inView,
} from "./lib/motion";

/* ---------- Brand ---------- */
export { Logo, DnexSymbol } from "./components/brand/Logo";
export type { LogoProps } from "./components/brand/Logo";
export {
  ProductGlyph,
  DNEX_PRODUCT_KEYS,
  normalizeDnexProductKey,
} from "./components/brand/ProductGlyph";
export type {
  ProductGlyphProps,
  DnexProductKey,
} from "./components/brand/ProductGlyph";

/* ---------- Ilustrações (duotom índigo + âmbar) ---------- */
export {
  IllustrationEmpty,
  Illustration404,
  Illustration500,
  IllustrationSuccess,
  IllustrationNoPermission,
  IllustrationNoConnection,
  IllustrationOnboarding,
} from "./components/illustrations";
export type { IllustrationProps } from "./components/illustrations";

/* ---------- Primitivos ---------- */
export { Button } from "./components/primitives/Button";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from "./components/primitives/Button";
export { Input } from "./components/primitives/Input";
export type { InputProps } from "./components/primitives/Input";
export { Textarea } from "./components/primitives/Textarea";
export type { TextareaProps } from "./components/primitives/Textarea";
export { Label } from "./components/primitives/Label";
export type { LabelProps } from "./components/primitives/Label";
export { Select } from "./components/primitives/Select";
export type { SelectOption } from "./components/primitives/Select";
export { Checkbox } from "./components/primitives/Checkbox";
export type { CheckboxProps } from "./components/primitives/Checkbox";
export { RadioGroup, RadioItem } from "./components/primitives/Radio";
export { Switch } from "./components/primitives/Switch";
export type { SwitchProps } from "./components/primitives/Switch";
export { Badge } from "./components/primitives/Badge";
export type { BadgeProps, BadgeTone } from "./components/primitives/Badge";
export { Avatar } from "./components/primitives/Avatar";
export type { AvatarProps } from "./components/primitives/Avatar";
export { Tooltip, TooltipProvider } from "./components/primitives/Tooltip";
export type { TooltipProps } from "./components/primitives/Tooltip";
export { Separator } from "./components/primitives/Separator";
export type { SeparatorProps } from "./components/primitives/Separator";
export { Kbd } from "./components/primitives/Kbd";
export { ListButton } from "./components/primitives/ListButton";
export type { ListButtonProps } from "./components/primitives/ListButton";

/* ---------- Inputs especializados (C2b) ---------- */
export { SearchInput } from "./components/primitives/SearchInput";
export type { SearchInputProps } from "./components/primitives/SearchInput";
export { SegmentedControl } from "./components/primitives/SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedItem,
} from "./components/primitives/SegmentedControl";
export { Slider, RangeSlider } from "./components/primitives/Slider";
export type {
  SliderProps,
  RangeSliderProps,
} from "./components/primitives/Slider";
export { Combobox } from "./components/primitives/Combobox";
export type { ComboboxProps } from "./components/primitives/Combobox";
export { MultiSelect } from "./components/primitives/MultiSelect";
export type { MultiSelectProps } from "./components/primitives/MultiSelect";
export type { ComboOption } from "./components/primitives/comboboxShared";
export { FileUpload, formatBytes } from "./components/primitives/FileUpload";
export type {
  FileUploadProps,
  FileRejection,
} from "./components/primitives/FileUpload";

/* ---------- Camada de formulário (C2a) — RHF + zod ---------- */
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "./components/form";
export type { FormProps } from "./components/form";

/* ---------- Inputs Fiscais (BR) — C3 ---------- */
export {
  CurrencyInput,
  CnpjInput,
  CpfInput,
  CepInput,
  TelefoneInput,
  WhatsAppInput,
  PercentInput,
  DateInputBR,
} from "./components/inputs-br";
export type {
  CurrencyInputProps,
  CnpjInputProps,
  CpfInputProps,
  CepInputProps,
  TelefoneInputProps,
  WhatsAppInputProps,
  PercentInputProps,
  DateInputBRProps,
} from "./components/inputs-br";

/* ---------- Utilitários BR (máscara/validação puras) ---------- */
export {
  onlyDigits,
  normalizeCnpj,
  maskCpf,
  isValidCpf,
  maskCnpj,
  isValidCnpj,
  maskCep,
  isCompleteCep,
  maskTelefone,
  isCompleteTelefone,
  formatBRL,
  centsToBRL,
  parseBRLToCents,
  parseBRL,
  formatPercent,
  parsePercent,
  clamp,
  maskDateBR,
  isValidDateBR,
  parseDateBR,
  formatDateBR,
} from "./lib/br";

/* ---------- Compostos ---------- */
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "./components/composed/Card";
export type { CardProps } from "./components/composed/Card";
export { SectionPanel } from "./components/composed/SectionPanel";
export type { SectionPanelProps } from "./components/composed/SectionPanel";
export { ActionBanner } from "./components/composed/ActionBanner";
export type {
  ActionBannerProps,
  ActionBannerTone,
} from "./components/composed/ActionBanner";
export { StatCard } from "./components/composed/StatCard";
export type { StatCardProps } from "./components/composed/StatCard";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components/composed/Tabs";
export { Accordion, AccordionItem } from "./components/composed/Accordion";
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
} from "./components/composed/Dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "./components/composed/DropdownMenu";
export { ToastProvider, useToast } from "./components/composed/Toast";
export { Alert } from "./components/composed/Alert";
export type { AlertProps, AlertTone } from "./components/composed/Alert";
export { Skeleton, SkeletonStat } from "./components/composed/Skeleton";
export { Progress } from "./components/composed/Progress";
export type { ProgressProps } from "./components/composed/Progress";
export { Pagination } from "./components/composed/Pagination";
export type { PaginationProps } from "./components/composed/Pagination";
export { Breadcrumb } from "./components/composed/Breadcrumb";
export type { BreadcrumbProps, Crumb } from "./components/composed/Breadcrumb";
export { Table } from "./components/composed/Table";
export type { TableProps, Column } from "./components/composed/Table";
export { DataTable, makeSelectionColumn } from "./components/composed/DataTable";
export type {
  DataTableProps,
  DataTableDensity,
  DnexColumnDef,
} from "./components/composed/DataTable";
export { Timeline, TimelineItem } from "./components/composed/Timeline";
export type {
  TimelineProps,
  TimelineItemProps,
  TimelineTone,
} from "./components/composed/Timeline";
export {
  DescriptionList,
  DescriptionItem,
} from "./components/composed/DescriptionList";
export type {
  DescriptionListProps,
  DescriptionItemProps,
} from "./components/composed/DescriptionList";
export { EmptyState } from "./components/composed/EmptyState";
export type { EmptyStateProps } from "./components/composed/EmptyState";
export { ErrorState } from "./components/composed/ErrorState";
export type { ErrorStateProps } from "./components/composed/ErrorState";
export { ErrorPage } from "./components/composed/ErrorPage";
export type {
  ErrorPageProps,
  ErrorPageVariant,
} from "./components/composed/ErrorPage";
export { ThemeSwitcher } from "./components/composed/ThemeSwitcher";
export type { ThemeSwitcherProps } from "./components/composed/ThemeSwitcher";
export { DensityToggle } from "./components/composed/DensityToggle";
export type { DensityToggleProps } from "./components/composed/DensityToggle";
export { Spinner, PageLoader, DnexLoadingMark } from "./components/composed/Spinner";
export type {
  SpinnerProps,
  SpinnerSize,
  PageLoaderProps,
  DnexLoadingMarkProps,
} from "./components/composed/Spinner";
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from "./components/composed/Popover";
export type { PopoverContentProps } from "./components/composed/Popover";

/* ---------- Overlays (C5a) — Sheet · ConfirmDialog · HoverCard ---------- */
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
} from "./components/composed/Sheet";
export type {
  SheetContentProps,
  SheetSide,
  SheetSize,
} from "./components/composed/Sheet";
export {
  ConfirmDialog,
  ConfirmProvider,
  useConfirm,
} from "./components/composed/ConfirmDialog";
export type {
  ConfirmDialogProps,
  ConfirmTone,
} from "./components/composed/ConfirmDialog";
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./components/composed/HoverCard";
export type { HoverCardContentProps } from "./components/composed/HoverCard";

/* ---------- Command Palette (C5b) — ⌘K estilo Linear ---------- */
export {
  CommandPalette,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  useCommandPalette,
} from "./components/composed/CommandPalette";
export type {
  CommandPaletteProps,
  CommandItemProps,
} from "./components/composed/CommandPalette";

/* ---------- Billing (C5c) — Stripe-ready ---------- */
export { PricingCard } from "./components/composed/PricingCard";
export type {
  PricingCardProps,
  BillingPeriod,
} from "./components/composed/PricingCard";
export { UsageMeter } from "./components/composed/UsageMeter";
export type { UsageMeterProps } from "./components/composed/UsageMeter";
export { FeatureList } from "./components/composed/FeatureList";
export type {
  FeatureListProps,
  FeatureItem,
} from "./components/composed/FeatureList";

/* ---------- Calendário / Datas ---------- */
export { Calendar } from "./components/composed/Calendar";
export type { CalendarProps } from "./components/composed/Calendar";
export { DatePicker } from "./components/composed/DatePicker";
export type {
  DatePickerProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
} from "./components/composed/DatePicker";

/* ---------- Wizard / Stepper ---------- */
export { Stepper } from "./components/composed/Stepper";
export type {
  StepperProps,
  StepItem,
  StepState,
} from "./components/composed/Stepper";
export { Wizard } from "./components/composed/Wizard";
export type { WizardProps, WizardStep } from "./components/composed/Wizard";

/* ---------- Central de Notificações ---------- */
export {
  NotificationCenter,
  NotificationItem,
} from "./components/composed/NotificationCenter";
export type {
  NotificationCenterProps,
  NotificationItemProps,
  DnexNotification,
  NotificationType,
} from "./components/composed/NotificationCenter";

/* ---------- Gráficos / Data Viz ---------- */
export {
  AreaChartDnex,
  LineChartDnex,
  BarChartDnex,
  DonutChartDnex,
  RadialChartDnex,
  RadarChartDnex,
  Sparkline,
  GaugeChart,
  FunnelChart,
  ChartTooltip,
  useChartTheme,
} from "./components/charts";
export type {
  CartesianScaleProps,
  YDomain,
  YDomainEdge,
  ReferenceLineSpec,
  ReferenceLineTone,
  AreaChartDnexProps,
  LineChartDnexProps,
  LineSeries,
  BarChartDnexProps,
  BarSeries,
  DonutChartDnexProps,
  DonutSlice,
  RadialChartDnexProps,
  RadialTrack,
  RadarChartDnexProps,
  RadarSeries,
  SparklineProps,
  SparklineTrend,
  GaugeChartProps,
  GaugeThreshold,
  FunnelChartProps,
  FunnelStage,
} from "./components/charts";

/* ---------- Blocks de Auth (D1b) — PasswordField · OtpInput ---------- */
export {
  PasswordField,
  scorePassword,
} from "./components/auth/PasswordField";
export type {
  PasswordFieldProps,
  PasswordStrength,
} from "./components/auth/PasswordField";
export { OtpInput } from "./components/auth/OtpInput";
export type { OtpInputProps } from "./components/auth/OtpInput";

/* ---------- App Shell ---------- */
export {
  Sidebar,
  SidebarDrawer,
  SidebarDrawerTrigger,
  MobileMenu,
  MobileMenuTrigger,
} from "./components/shell/Sidebar";
export type {
  SidebarProps,
  SidebarNavItem,
  SidebarDrawerProps,
  SidebarDrawerGlobalItem,
  MobileMenuProps,
} from "./components/shell/Sidebar";
export { Topbar } from "./components/shell/Topbar";
export type { TopbarProps } from "./components/shell/Topbar";
export { GlobalRail } from "./components/shell/GlobalRail";
export type { GlobalRailProps, GlobalRailProduct, GlobalRailAvailability } from "./components/shell/GlobalRail";
export { getGlobalRailAvailability, getGlobalRailAvailabilityLabel, getGlobalRailDescription, isGlobalRailActionable } from "./components/shell/globalRailAvailability";
export { TopbarContext } from "./components/shell/TopbarContext";
export type { TopbarContextProps } from "./components/shell/TopbarContext";
export {
  TopbarGlobalActions,
  TopbarHubLink,
} from "./components/shell/TopbarGlobalActions";
export type {
  TopbarGlobalActionsProps,
  TopbarHubLinkProps,
} from "./components/shell/TopbarGlobalActions";
export { AppLauncher } from "./components/shell/AppLauncher";
export type { AppLauncherProps, DnexApp } from "./components/shell/AppLauncher";
export { PageHeader } from "./components/shell/PageHeader";
export type { PageHeaderProps, PageHeaderBadge } from "./components/shell/PageHeader";
export { SidebarWorkspace } from "./components/shell/SidebarWorkspace";
export type { SidebarWorkspaceProps } from "./components/shell/SidebarWorkspace";
export { SidebarStatus } from "./components/shell/SidebarStatus";
export type { SidebarStatusProps } from "./components/shell/SidebarStatus";
export { SidebarAccount } from "./components/shell/SidebarAccount";
export type { SidebarAccountProps } from "./components/shell/SidebarAccount";
export { PageContainer } from "./components/shell/PageContainer";
export type { PageContainerProps } from "./components/shell/PageContainer";
export { StatsGrid } from "./components/shell/StatsGrid";
export type { StatsGridProps } from "./components/shell/StatsGrid";

/* ---------- Layouts reutilizáveis (D1a) — Auth · App · Settings ---------- */
export {
  AuthLayout,
  AuthMarketingPanel,
  AppLayout,
  SettingsLayout,
} from "./layouts";
export type {
  AuthLayoutProps,
  AppLayoutProps,
  SettingsLayoutProps,
  SettingsNavItem,
} from "./layouts";

/* ---------- Telas de Auth (D1c) — page templates em AuthLayout ---------- */
export {
  AuthCard,
  AuthLink,
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyEmailScreen,
  MfaScreen,
  AcceptInviteScreen,
  AccountBlockedScreen,
} from "./screens/auth";
export type {
  AuthCardProps,
  LoginScreenProps,
  LoginValues,
  SignupScreenProps,
  SignupValues,
  ForgotPasswordScreenProps,
  ForgotPasswordValues,
  ResetPasswordScreenProps,
  ResetPasswordValues,
  VerifyEmailScreenProps,
  MfaScreenProps,
  AcceptInviteScreenProps,
  AcceptInviteValues,
  AccountBlockedScreenProps,
  AccountBlockedReason,
} from "./screens/auth";

/* ---------- Telas de Configurações (D2a) — em SettingsLayout ---------- */
export {
  SettingsSection,
  SettingRow,
  SettingRows,
  SettingsStack,
  ProfileSettings,
  SecuritySettings,
  CompanySettings,
  TeamSettings,
  ROLE_LABELS,
  NotificationSettings,
  BillingSettings,
  IntegrationsSettings,
  ApiKeysSettings,
  RolesPermissionsSettings,
} from "./screens/settings";
export type {
  SettingsSectionProps,
  ProfileSettingsProps,
  ProfileValues,
  SecuritySettingsProps,
  ChangePasswordValues,
  Session,
  CompanySettingsProps,
  CompanyValues,
  TeamSettingsProps,
  TeamMember,
  TeamRole,
  MemberStatus,
  InviteValues,
  NotificationSettingsProps,
  NotificationPrefs,
  NotificationKind,
  NotificationChannel,
  BillingSettingsProps,
  Invoice,
  InvoiceStatus,
  UsageItem,
  IntegrationsSettingsProps,
  Integration,
  IntegrationStatus,
  ApiKeysSettingsProps,
  ApiKey,
  CreateKeyValues,
  RolesPermissionsSettingsProps,
  RoleMatrix,
  ModuleKey,
  PermissionAction,
} from "./screens/settings";

/* ---------- Telas de Onboarding (D2b) ---------- */
export {
  CreateWorkspaceScreen,
  SetupWizardScreen,
  InviteTeamScreen,
} from "./screens/onboarding";
export type {
  CreateWorkspaceScreenProps,
  CreateWorkspaceValues,
  SetupWizardScreenProps,
  SetupData,
  InviteTeamScreenProps,
  PendingInvite,
} from "./screens/onboarding";

/* ---------- Templates CRUD genéricos (D3a) — o quarteto reutilizável ---------- */
export {
  CrudListTemplate,
  CrudFormTemplate,
  CrudDetailTemplate,
} from "./templates/crud";
export type {
  CrudListTemplateProps,
  CrudFormTemplateProps,
  CrudFormMode,
  CrudFormSurface,
  CrudDetailTemplateProps,
  CrudDetailField,
} from "./templates/crud";

/* ---------- Telas CRUD aplicadas (D3b) — exemplos concretos ---------- */
export {
  UsersCrud,
  DepartmentsCrud,
  CollaboratorsCrud,
} from "./screens/crud";
export type {
  UsersCrudProps,
  UserRow,
  UserRole,
  UserStatus,
  Department,
  Collaborator,
} from "./screens/crud";
export { iniciais } from "./components/shell/Sidebar";
export { StatusPipeline } from "./components/charts/StatusPipeline";
export type { StatusPipelineProps, StatusPipelineStage } from "./components/charts/StatusPipeline";
export { StatusPipelineFilters } from "./components/charts/StatusPipeline";
export type { StatusPipelineFiltersProps } from "./components/charts/StatusPipeline";
