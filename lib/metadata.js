// Returns project.dataset string. Optional dataset override.
function PROJECT_DATASET(dataset = dataform.projectConfig.defaultSchema) {
  return `${dataform.projectConfig.defaultDatabase}.${dataset}`;
}

// List all tables in a dataset
function DATASET_TABLES(dataset = dataform.projectConfig.defaultSchema) {
  return `
SELECT 
  table_name, 
  row_count, 
  creation_time, 
  last_modified_time
FROM ${PROJECT_DATASET(dataset)}.INFORMATION_SCHEMA.TABLES
ORDER BY table_name
`;
}

// Get table metadata including partitioning and size
function TABLE_METADATA(table_name, dataset = dataform.projectConfig.defaultSchema) {
  return `
SELECT 
  table_name,
  row_count,
  creation_time,
  last_modified_time,
  CASE WHEN partitioning_column IS NOT NULL THEN TRUE ELSE FALSE END AS is_partitioned,
  SUM(size_bytes)/POWER(1024,3) AS size_gb
FROM ${PROJECT_DATASET(dataset)}.INFORMATION_SCHEMA.TABLES
WHERE table_name = '${table_name}'
GROUP BY table_name, row_count, creation_time, last_modified_time, partitioning_column
`;
}

// List partitions for a dataset
function DATASET_PARTITIONS(dataset = dataform.projectConfig.defaultSchema) {
  return `
SELECT 
  table_name,	
  partition_id,	
  total_rows,	
  CAST((total_logical_bytes/POWER(1024, 3)) AS NUMERIC) AS size_gb,
  last_modified_time
FROM ${PROJECT_DATASET(dataset)}.INFORMATION_SCHEMA.PARTITIONS
ORDER BY table_name, partition_id DESC
`;
}

// List partitions for a specific table
function TABLE_PARTITIONS(table_name, dataset = dataform.projectConfig.defaultSchema) {
  return `
SELECT 
  partition_id,
  total_rows,
  CAST((total_logical_bytes/POWER(1024, 3)) AS NUMERIC) AS size_gb,
  last_modified_time
FROM ${PROJECT_DATASET(dataset)}.INFORMATION_SCHEMA.PARTITIONS
WHERE table_name = '${table_name}'
ORDER BY partition_id DESC
`;
}

// Return table schema (columns, types, nullable)
function TABLE_SCHEMA(table_name, dataset = dataform.projectConfig.defaultSchema) {
  return `
SELECT 
  column_name,
  data_type,
  is_nullable,
  description
FROM ${PROJECT_DATASET(dataset)}.INFORMATION_SCHEMA.COLUMNS
WHERE table_name = '${table_name}'
ORDER BY ordinal_position
`;
}

module.exports = {
  PROJECT_DATASET,
  DATASET_PARTITIONS,
  DATASET_TABLES,
  TABLE_PARTITIONS,
  TABLE_SCHEMA,
  TABLE_METADATA
};
