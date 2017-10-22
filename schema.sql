CREATE TABLE csv_uploads (
  batch_id VARCHAR(255) PRIMARY KEY,
  date_time DATETIME,
  csv_path VARCHAR(255),
  response_code VARCHAR(100),
  response_message VARCHAR(255),
  response_body VARCHAR(255)
);
