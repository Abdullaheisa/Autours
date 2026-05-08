import { BadgeProps } from "@/components/ui/Badge";

export function getStatusBadgeProps(status: string): { variant: BadgeProps["variant"]; showDot: boolean } {
  switch (status?.toLowerCase()) {
    case "active":
    case "published":
    case "completed":
    case "success":
      return { variant: "success", showDot: true };
    case "pending":
    case "draft":
    case "warning":
      return { variant: "warning", showDot: true };
    case "scheduled":
      return { variant: "purple", showDot: true };
    case "suspended":
    case "cancelled":
    case "destructive":
    case "error":
      return { variant: "destructive", showDot: true };
    case "inactive":
    case "gray":
      return { variant: "gray", showDot: true };
    default:
      return { variant: "outline", showDot: false };
  }
}
