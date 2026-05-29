import { DataSource } from "@/types";

import { SourceBadge } from "./source-badge";

interface DataSourceBadgeProps {
  source: DataSource;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  return <SourceBadge source={source} />;
}
