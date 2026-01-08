import { ReviewStatus } from "@/shared/types";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

export const REVIEW_STATUSES: ReviewStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<
  ReviewStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export const statuses = [
  {
    value: "PENDING",
    label: "Pending",
    icon: CircleIcon,
  },
  {
    value: "APPROVED",
    label: "Approved",
    icon: CheckCircledIcon,
  },
  {
    value: "REJECTED",
    label: "Rejected",
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
  {
    label: "Critical",
    value: "critical",
    icon: ExclamationTriangleIcon,
  },
];
