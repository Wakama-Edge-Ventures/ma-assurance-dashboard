import { DataSource } from "@/types";

import { Badge } from "./badge";

interface DataSourceBadgeProps {
  source: DataSource;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  if (source === "LIVE") {
    return <Badge variant="success">LIVE</Badge>;
  }

  return <Badge variant="warning">SEED_DEMO</Badge>;
}
